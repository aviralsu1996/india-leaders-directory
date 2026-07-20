import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const logs: string[] = ["[INIT] Triggered Supabase Edge Function: sync-news"];

  try {
    // Read environment variables inside Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const newsApiKey = Deno.env.get("NEWS_API_KEY") || "";
    const gnewsApiKey = Deno.env.get("GNEWS_API_KEY") || "";
    const mediastackApiKey = Deno.env.get("MEDIASTACK_API_KEY") || "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase configuration environment variables.");
    }

    // Create Supabase Admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch active leaders
    const { data: leaders, error: leadersError } = await supabase
      .from("leaders")
      .select("slug, name, constituency, party, designation")
      .eq("status", "Published");

    if (leadersError) {
      throw new Error(`Failed to load leaders from database: ${leadersError.message}`);
    }

    logs.push(`[DATABASE] Loaded ${leaders?.length || 0} active leaders for syncing`);

    if (!leaders || leaders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No active leaders found to sync.", logs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalSaved = 0;

    // We process leaders. To prevent hitting free tier api rate limits, we sync the first few or do sequentially
    for (const leader of leaders) {
      logs.push(`[LEADER] Processing news sync for ${leader.name}`);
      let fetchedArticles: any[] = [];
      let providerName = "";

      // Sequential Provider Fallback strategy
      // Try Google News RSS (Doesn't require API key, high reliability)
      try {
        const query = encodeURIComponent(`${leader.name} ${leader.designation || ""}`.trim());
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-IN&gl=IN&ceid=IN:en`;
        const rssProxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const res = await fetch(rssProxyUrl);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "ok" && data.items && data.items.length > 0) {
            fetchedArticles = data.items.map((item: any) => ({
              leader_slug: leader.slug,
              title: item.title || "",
              summary: item.description || item.content || "",
              content: item.content || item.description || "",
              source: item.author || "Google News",
              source_url: item.link || "",
              image_url: item.thumbnail || "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500",
              category: "Politics",
              published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            }));
            providerName = "Google News RSS";
          }
        }
      } catch (e) {
        logs.push(`[PROVIDER WARN] Google News RSS failed for ${leader.name}: ${e.message}`);
      }

      // If RSS fails and GNews key is available, try GNews
      if (fetchedArticles.length === 0 && gnewsApiKey) {
        try {
          const query = encodeURIComponent(`"${leader.name}"`);
          const res = await fetch(`https://gnews.io/api/v4/search?q=${query}&lang=en&country=in&apikey=${gnewsApiKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data.articles && data.articles.length > 0) {
              fetchedArticles = data.articles.map((item: any) => ({
                leader_slug: leader.slug,
                title: item.title,
                summary: item.description,
                content: item.content,
                source: item.source?.name || "GNews",
                source_url: item.url,
                image_url: item.image || "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500",
                category: "Politics",
                published_at: item.publishedAt || new Date().toISOString(),
              }));
              providerName = "GNews API";
            }
          }
        } catch (e) {
          logs.push(`[PROVIDER WARN] GNews API failed for ${leader.name}: ${e.message}`);
        }
      }

      // Fallback to NewsAPI if still empty and key is available
      if (fetchedArticles.length === 0 && newsApiKey) {
        try {
          const query = encodeURIComponent(`"${leader.name}"`);
          const res = await fetch(`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === "ok" && data.articles && data.articles.length > 0) {
              fetchedArticles = data.articles.map((item: any) => ({
                leader_slug: leader.slug,
                title: item.title,
                summary: item.description,
                content: item.content,
                source: item.source?.name || "NewsAPI",
                source_url: item.url,
                image_url: item.urlToImage || "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=500",
                category: "Politics",
                published_at: item.publishedAt || new Date().toISOString(),
              }));
              providerName = "NewsAPI";
            }
          }
        } catch (e) {
          logs.push(`[PROVIDER WARN] NewsAPI failed for ${leader.name}: ${e.message}`);
        }
      }

      if (fetchedArticles.length > 0) {
        logs.push(`[SYNC] Retrieved ${fetchedArticles.length} items from ${providerName}`);

        // Deduplicate & Save
        for (const art of fetchedArticles) {
          // Check if article already exists in Supabase
          const { data: existing, error: existError } = await supabase
            .from("news")
            .select("id")
            .eq("leader_slug", leader.slug)
            .eq("title", art.title)
            .limit(1);

          if (!existError && (!existing || existing.length === 0)) {
            const { error: insertError } = await supabase
              .from("news")
              .insert([art]);

            if (!insertError) {
              totalSaved++;
            }
          }
        }
      } else {
        logs.push(`[SYNC WARN] No news retrieved for ${leader.name}`);
      }
    }

    logs.push(`[SUCCESS] News sync completed. Saved ${totalSaved} new articles.`);

    return new Response(
      JSON.stringify({ success: true, processed: leaders.length, added: totalSaved, logs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    logs.push(`[ERROR] Execution failed: ${err.message}`);
    return new Response(
      JSON.stringify({ success: false, error: err.message, logs }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
