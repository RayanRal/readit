-- Create links table
create table public.links (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  title text,
  status text not null default 'unread' check (status in ('unread', 'read')),
  content jsonb,
  created_at timestamp with time zone not null default now(),
  constraint links_pkey primary key (id)
);

-- Enable RLS
alter table public.links enable row level security;

-- Create policies
create policy "Users can view their own links" on public.links
  for select using ((select auth.uid()) = user_id);

create policy "Users can insert their own links" on public.links
  for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own links" on public.links
  for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own links" on public.links
  for delete using ((select auth.uid()) = user_id);
