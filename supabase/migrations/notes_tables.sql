-- Create notes table
create table notes (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    url text not null,
    status text default 'pending' check (status in ('pending', 'published', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    chapter_id uuid references chapters(id) on delete cascade not null
);

-- Set up Row Level Security (RLS)
alter table notes enable row level security;

-- Create policies
create policy "Notes are viewable by everyone" 
on notes for select 
to authenticated
using (true);

create policy "Only admins can insert/update/delete notes" 
on notes for all 
to authenticated
using (
    auth.jwt() ->> 'email' in (
        select email from profiles where role = 'admin'
    )
)
with check (
    auth.jwt() ->> 'email' in (
        select email from profiles where role = 'admin'
    )
);

-- Create indexes
create index notes_status_idx on notes(status);
create index notes_chapter_id_idx on notes(chapter_id);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;
