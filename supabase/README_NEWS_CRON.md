# Automatic news sync — one-time Supabase setup

Migration `005_schedule_news_sync.sql` schedules the `sync-news` Edge
Function to run automatically every 6 hours via `pg_cron` + `pg_net`, in a
random batch of leaders per run (see the function source for why it's
batched). Two things can't be committed to git and must be set once, by
hand, in the **Supabase SQL Editor** for your project:

```sql
ALTER DATABASE postgres SET app.settings.supabase_url = 'https://<your-project-ref>.supabase.co';
ALTER DATABASE postgres SET app.settings.service_role_key = '<your-service-role-key>';
```

Replace `<your-project-ref>` and `<your-service-role-key>` with the values
from **Project Settings → API** in your Supabase dashboard. The service
role key is required because the Edge Function's own `SUPABASE_SERVICE_ROLE_KEY`
env var (used to bypass RLS when writing news rows) is separate from the
bearer token needed to *invoke* the function over HTTP — pg_net makes a
plain HTTP call and needs that token in the `Authorization` header.

## Deploy order

1. Apply migrations in order (`001` through `005`) via the Supabase SQL
   Editor or `supabase db push`.
2. Deploy the Edge Function: `supabase functions deploy sync-news`.
3. Set the Edge Function's own secrets (used internally, not for pg_net):
   ```
   supabase secrets set NEWS_API_KEY=... GNEWS_API_KEY=... MEDIASTACK_API_KEY=...
   ```
   (All three are optional — Google News RSS requires no key and is tried
   first; the others are fallbacks if it returns nothing.)
4. Run the two `ALTER DATABASE` commands above from the SQL Editor.
5. Confirm the schedule exists: `SELECT * FROM cron.job;`
6. Confirm runs are succeeding: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;`

## Verifying it's working

```sql
select leader_slug, count(*) from public.news group by leader_slug order by count(*) desc limit 10;
```

If this returns rows growing over time across multiple leaders, the
scheduled sync is populating news automatically. The admin "Sync" button
in `AdminNewsManager` still works for on-demand, single-leader syncs and
is unaffected by this change.
