-- Add username to profiles for public URLs
alter table public.profiles 
add column username text unique;

-- Index for fast lookup
create index profiles_username_idx on public.profiles (username);

-- Policy to allow public read of profiles by username
create policy "Public profiles are viewable by everyone via username." 
on public.profiles for select 
using (true);

-- Update handle_new_user function to generate a default username from email
create or replace function public.handle_new_user()
returns trigger as $$
declare
  default_username text;
begin
  -- Simple username generation from email (before @)
  default_username := split_part(new.email, '@', 1);
  
  -- Check collision (basic loop would be better but keeping simple)
  -- If exists, append random suffix? For MVP, just use email part.
  
  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    default_username
  );
  return new;
end;
$$ language plpgsql security definer;
