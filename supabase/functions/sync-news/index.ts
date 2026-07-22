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

    // Bound how many leaders a single invocation processes. With ~668 leaders and up
    // to 3 sequential provider HTTP calls each, an unbounded loop risks exceeding the
    // Edge Function execution time limit and never completing a run. A scheduled cron
    // (migration 005) calls this function every 6 hours; a random batch each run means
    // every leader gets covered over time instead of the same alphabetical prefix
    // always winning (and everyone after a timeout never being processed).
    let batchLimit = 40;
    try {
      const body = await req.json();
      if (body && Number.isFinite(body.limit) && body.limit > 0) {
        batchLimit = Math.min(body.limit, 200);
      }
    } catch {
      // No/invalid JSON body — use the default batch size.
    }

    // Create Supabase Admin client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Fetch active leaders
    const { data: allLeaders, error: leadersError } = await supabase
      .from("leaders")
      .select("slug, name, constituency, party, designation")
      .eq("status", "Published");

    if (leadersError) {
      throw new Error(`Failed to load leaders from database: ${leadersError.message}`);
    }

    logs.push(`[DATABASE] Loaded ${allLeaders?.length || 0} active leaders`);

    if (!allLeaders || allLeaders.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: "No active leaders found to sync.", logs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Shuffle so repeated scheduled runs cover different leaders instead of always
    // stalling on the same alphabetical prefix if a run times out partway through.
    const leaders = [...allLeaders].sort(() => Math.random() - 0.5).slice(0, batchLimit);
    logs.push(`[BATCH] Processing ${leaders.length} of ${allLeaders.length} leaders this run (limit=${batchLimit})`);

    let totalSaved = 0;

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
              image_url: item.thumbnail || "",
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
                image_url: item.image || "",
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
                image_url: item.urlToImage || "",
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

        // Upsert against the (leader_slug, title) unique constraint (migration 004).
        // This is race-safe across concurrent/overlapping cron runs, unlike a
        // check-then-insert pattern which can double-insert the same article.
        const { data: saved, error: upsertError } = await supabase
          .from("news")
          .upsert(fetchedArticles, { onConflict: "leader_slug,title", ignoreDuplicates: true })
          .select("id");

        if (upsertError) {
          logs.push(`[SYNC ERROR] Upsert failed for ${leader.name}: ${upsertError.message}`);
        } else {
          totalSaved += saved?.length || 0;
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
