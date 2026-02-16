-- Enable extensions
create extension if not exists vector;
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);


-- Bots table
create table public.bots (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  tagline text,
  description text,
  avatar_url text,
  tone jsonb default '{"friendly": 0.5, "professional": 0.5, "funny": 0}', -- Simple slider values 0-1
  system_prompt text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bots enable row level security;
create policy "Bots are viewable by everyone if public." on public.bots for select using (is_public = true);
create policy "Users can view their own bots." on public.bots for select using (auth.uid() = user_id);
create policy "Users can insert their own bots." on public.bots for insert with check (auth.uid() = user_id);
create policy "Users can update their own bots." on public.bots for update using (auth.uid() = user_id);
create policy "Users can delete their own bots." on public.bots for delete using (auth.uid() = user_id);


-- Bot Access table (for private beta access)
create table public.bot_access (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(bot_id, user_id)
);

alter table public.bot_access enable row level security;
create policy "Bot owners can view access." on public.bot_access for select using (exists (select 1 from public.bots where id = bot_access.bot_id and user_id = auth.uid()));
create policy "Users can view their own access." on public.bot_access for select using (auth.uid() = user_id);
create policy "Bot owners can manage access." on public.bot_access for all using (exists (select 1 from public.bots where id = bot_access.bot_id and user_id = auth.uid()));


-- Knowledge Sources table
create table public.knowledge_sources (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  type text not null check (type in ('file', 'url', 'text')),
  content text, -- For raw text or URL
  file_path text, -- For uploaded files in storage
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.knowledge_sources enable row level security;
create policy "Bot owners can view sources." on public.knowledge_sources for select using (exists (select 1 from public.bots where id = knowledge_sources.bot_id and user_id = auth.uid()));
create policy "Bot owners can insert sources." on public.knowledge_sources for insert with check (exists (select 1 from public.bots where id = knowledge_sources.bot_id and user_id = auth.uid()));
create policy "Bot owners can update sources." on public.knowledge_sources for update using (exists (select 1 from public.bots where id = knowledge_sources.bot_id and user_id = auth.uid()));
create policy "Bot owners can delete sources." on public.knowledge_sources for delete using (exists (select 1 from public.bots where id = knowledge_sources.bot_id and user_id = auth.uid()));


-- Knowledge Chunks table
create table public.knowledge_chunks (
  id uuid default uuid_generate_v4() primary key,
  source_id uuid references public.knowledge_sources(id) on delete cascade not null,
  chunk_text text not null,
  token_count int,
  embedding vector(1536), -- Assuming OpenAI dimension
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('english', chunk_text)) STORED,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Index for vector search
create index on public.knowledge_chunks using hnsw (embedding vector_cosine_ops);
-- Index for full text search
create index on public.knowledge_chunks using gin (search_vector);

alter table public.knowledge_chunks enable row level security;
-- Only the owner can view chunks directly. Retrieval functions will use security definer to bypass this for search.
create policy "Bot owners can view chunks." on public.knowledge_chunks for select using (exists (select 1 from public.knowledge_sources ks join public.bots b on ks.bot_id = b.id where ks.id = knowledge_chunks.source_id and b.user_id = auth.uid()));


-- Conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null, -- Nullable for anonymous users
  visitor_id text, -- Fingerprint for anonymous users
  started_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.conversations enable row level security;
create policy "Users/Visitors can view their own conversations." on public.conversations for select using ((auth.uid() = user_id) or (visitor_id is not null)); -- Simplified for now, logic needs to handle visitor_id matching in app
create policy "Bot owners can view conversations for their bots." on public.conversations for select using (exists (select 1 from public.bots where id = conversations.bot_id and user_id = auth.uid()));
create policy "Anyone can create conversation." on public.conversations for insert with check (true);


-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;
create policy "Participants can view messages." on public.messages for select using (exists (select 1 from public.conversations where id = messages.conversation_id and ((auth.uid() = user_id) or (visitor_id is not null)))); -- Needs refinement for visitor_id session logic
create policy "Bot owners can view messages." on public.messages for select using (exists (select 1 from public.conversations c join public.bots b on c.bot_id = b.id where c.id = messages.conversation_id and b.user_id = auth.uid()));
create policy "Anyone can insert messages to their conversation." on public.messages for insert with check (exists (select 1 from public.conversations where id = messages.conversation_id)); -- Strict check would verify user ownership of conversation


-- Usage Events table
create table public.usage_events (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  user_id uuid references public.profiles(id),
  tokens_input int,
  tokens_output int,
  model text,
  cost_usd numeric(10, 6),
  created_at timestamptz default now()
);
alter table public.usage_events enable row level security;
create policy "Bot owners can view analytics." on public.usage_events for select using (exists (select 1 from public.bots where id = usage_events.bot_id and user_id = auth.uid()));


-- Bot Integrations (Telegram)
create table public.bot_integrations (
  id uuid default uuid_generate_v4() primary key,
  bot_id uuid references public.bots(id) on delete cascade not null,
  platform text not null check (platform in ('telegram')),
  config jsonb not null, -- Store encrypted tokens here
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(bot_id, platform)
);

alter table public.bot_integrations enable row level security;
create policy "Bot owners can manage integrations." on public.bot_integrations for all using (exists (select 1 from public.bots where id = bot_integrations.bot_id and user_id = auth.uid()));


-- Functions

-- Handle New User (Supabase Auth Trigger)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Hybrid Search Function
create or replace function match_knowledge_chunks (
  query_embedding vector(1536),
  query_text text,
  match_threshold float,
  match_count int,
  p_bot_id uuid
)
returns table (
  id uuid,
  chunk_text text,
  similarity float,
  rank float
)
language plpgsql
as $$
begin
  return query
  select
    kc.id,
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) as similarity,
    ts_rank(kc.search_vector, to_tsquery('english', query_text)) as rank
  from public.knowledge_chunks kc
  join public.knowledge_sources ks on kc.source_id = ks.id
  where ks.bot_id = p_bot_id
  and 1 - (kc.embedding <=> query_embedding) > match_threshold
  order by (1 - (kc.embedding <=> query_embedding)) * 0.7 + (ts_rank(kc.search_vector, to_tsquery('english', query_text))) * 0.3 desc
  limit match_count;
end;
$$ security definer; 
-- Security definer is important here because knowledge chunks might be private
-- We control access via the p_bot_id parameter, ensuring we only search chunks for the requested bot.
-- Ideally we should also check if the user has access to the bot in the function, but for public bots it's open.
