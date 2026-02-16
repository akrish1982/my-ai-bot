-- Create a trigger to call the edge function when a new knowledge source is added
create trigger "ingest_knowledge_trigger"
after insert on public.knowledge_sources
for each row
execute function supabase_functions.http_request(
  'http://kong:8000/functions/v1/ingest-knowledge',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '1000'
);

-- Note: The above creates a "native" database webhook if using the Supabase Dashboard UI "Database Webhooks" feature is preferred.
-- However, for raw SQL, we usually use the `pg_net` extension or `supabase_functions` schema if available.
-- A more robust way in pure SQL on Supabase (standard) is using `pg_net`:

create extension if not exists pg_net;

create or replace function public.invoke_ingest_function()
returns trigger as $$
begin
  perform net.http_post(
    url := 'https://pdhcjhnmxvbtjimlggrl.supabase.co/functions/v1/ingest-knowledge', -- REPLACE WITH YOUR PROJECT URL
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := jsonb_build_object('record', row_to_json(new))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_knowledge_source_created
  after insert on public.knowledge_sources
  for each row execute procedure public.invoke_ingest_function();
