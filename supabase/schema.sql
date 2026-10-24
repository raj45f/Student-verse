-- ==============================================================================
-- StudentVerse — Database Schema & Row Level Security (RLS) Setup
-- Project: StudentVerse (Student Social Platform)
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
-- Stores public student profile data linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  campus text not null,
  bio text default '',
  avatar_url text default '',
  followers_count integer default 0 not null,
  following_count integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint username_format check (char_length(username) >= 3 and username ~* '^[a-zA-Z0-9_]+$')
);

alter table public.profiles add column if not exists followers_count integer default 0;
alter table public.profiles add column if not exists following_count integer default 0;

create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_campus on public.profiles(campus);

-- 3. POSTS TABLE (With Photo & Video Support)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default 'Campus update',
  image_url text default null,
  video_url text default null,
  media_type text default 'text', -- 'text', 'photo', 'video'
  likes_count integer default 0 not null,
  comments_count integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint content_not_empty check (char_length(trim(content)) > 0 or image_url is not null or video_url is not null)
);

alter table public.posts add column if not exists video_url text default null;
alter table public.posts add column if not exists media_type text default 'text';
alter table public.posts drop constraint if exists content_not_empty;
alter table public.posts add constraint content_not_empty check (char_length(trim(content)) > 0 or image_url is not null or video_url is not null);

create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);
create index if not exists idx_posts_media_type on public.posts(media_type);

-- 4. LIKES TABLE (One like per user per post)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_post_user_like unique(post_id, user_id)
);

create index if not exists idx_likes_post_id on public.likes(post_id);
create index if not exists idx_likes_user_id on public.likes(user_id);

-- 5. COMMENTS TABLE
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint comment_not_empty check (char_length(trim(content)) > 0 and char_length(content) <= 500)
);

create index if not exists idx_comments_post_id on public.comments(post_id);
create index if not exists idx_comments_created_at on public.comments(created_at asc);

-- 6. CAMPUS COMMUNITIES TABLE
create table if not exists public.campus_communities (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text not null,
  category text not null,
  member_count integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_communities_category on public.campus_communities(category);

-- 7. COMMUNITY MEMBERS TABLE (One membership per student per community)
create table if not exists public.community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.campus_communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_community_user_membership unique(community_id, user_id)
);

create index if not exists idx_comm_members_community on public.community_members(community_id);
create index if not exists idx_comm_members_user on public.community_members(user_id);

-- 8. FOLLOWS TABLE (Follow & Unfollow students)
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_follower_following unique(follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- 9. FRIEND REQUESTS TABLE (Friend Request, Accept, Reject, Friends)
create table if not exists public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint unique_friend_request unique(sender_id, receiver_id),
  constraint no_self_friend check (sender_id <> receiver_id)
);

create index if not exists idx_friend_req_sender on public.friend_requests(sender_id);
create index if not exists idx_friend_req_receiver on public.friend_requests(receiver_id);
create index if not exists idx_friend_req_status on public.friend_requests(status);

-- 10. MESSAGES / CHAT TABLE (Direct Messages & Campus Community Channels)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  community_id uuid references public.campus_communities(id) on delete cascade,
  content text not null,
  media_url text default null,
  media_type text default null, -- 'photo' or 'video'
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint has_destination check (receiver_id is not null or community_id is not null)
);

create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);
create index if not exists idx_messages_community on public.messages(community_id);
create index if not exists idx_messages_created_at on public.messages(created_at asc);


-- ==============================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- A. Auto-create Profile on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username, campus, avatar_url, bio)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Student User'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'username'), ''), 'student_' || substr(new.id::text, 1, 8)),
    coalesce(nullif(trim(new.raw_user_meta_data->>'campus'), ''), 'General Campus'),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'bio', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = excluded.username,
    campus = excluded.campus;
  return new;
exception
  when others then
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- B. Likes Count Maintenance Trigger
create or replace function public.handle_like_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set likes_count = likes_count + 1 where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.posts set likes_count = greatest(0, likes_count - 1) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_likes_count on public.likes;
create trigger trigger_likes_count
  after insert or delete on public.likes
  for each row execute procedure public.handle_like_count();


-- C. Comments Count Maintenance Trigger
create or replace function public.handle_comment_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.posts set comments_count = greatest(0, comments_count - 1) where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_comments_count on public.comments;
create trigger trigger_comments_count
  after insert or delete on public.comments
  for each row execute procedure public.handle_comment_count();


-- D. Community Members Count Maintenance Trigger
create or replace function public.handle_community_member_count()
returns trigger as $$
begin
  if (TG_OP = 'INSERT') then
    update public.campus_communities set member_count = member_count + 1 where id = new.community_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.campus_communities set member_count = greatest(0, member_count - 1) where id = old.community_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_community_members_count on public.community_members;
create trigger trigger_community_members_count
  after insert or delete on public.community_members
  for each row execute procedure public.handle_community_member_count();


-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. PROFILES RLS
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- 2. POSTS RLS
alter table public.posts enable row level security;

drop policy if exists "Posts are viewable by everyone" on public.posts;
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

drop policy if exists "Authenticated users can create posts" on public.posts;
create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);


-- 3. LIKES RLS
alter table public.likes enable row level security;

drop policy if exists "Likes are viewable by everyone" on public.likes;
create policy "Likes are viewable by everyone"
  on public.likes for select
  using (true);

drop policy if exists "Authenticated users can like posts" on public.likes;
create policy "Authenticated users can like posts"
  on public.likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own like" on public.likes;
create policy "Users can remove their own like"
  on public.likes for delete
  using (auth.uid() = user_id);


-- 4. COMMENTS RLS
alter table public.comments enable row level security;

drop policy if exists "Comments are viewable by everyone" on public.comments;
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

drop policy if exists "Authenticated users can comment" on public.comments;
create policy "Authenticated users can comment"
  on public.comments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own comment" on public.comments;
create policy "Users can delete their own comment"
  on public.comments for delete
  using (auth.uid() = user_id);


-- 5. CAMPUS COMMUNITIES RLS
alter table public.campus_communities enable row level security;

drop policy if exists "Communities are viewable by everyone" on public.campus_communities;
create policy "Communities are viewable by everyone"
  on public.campus_communities for select
  using (true);

drop policy if exists "Authenticated users can create communities" on public.campus_communities;
create policy "Authenticated users can create communities"
  on public.campus_communities for insert
  with check (auth.role() = 'authenticated');


-- 6. COMMUNITY MEMBERS RLS
alter table public.community_members enable row level security;

drop policy if exists "Memberships are viewable by everyone" on public.community_members;
create policy "Memberships are viewable by everyone"
  on public.community_members for select
  using (true);

drop policy if exists "Users can join communities" on public.community_members;
create policy "Users can join communities"
  on public.community_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave communities" on public.community_members;
create policy "Users can leave communities"
  on public.community_members for delete
  using (auth.uid() = user_id);


-- 7. FOLLOWS RLS
alter table public.follows enable row level security;

drop policy if exists "Follows are viewable by everyone" on public.follows;
create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow others" on public.follows;
create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow" on public.follows;
create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);


-- 8. FRIEND REQUESTS RLS
alter table public.friend_requests enable row level security;

drop policy if exists "Friend requests viewable by sender or receiver" on public.friend_requests;
create policy "Friend requests viewable by sender or receiver"
  on public.friend_requests for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Users can send friend requests" on public.friend_requests;
create policy "Users can send friend requests"
  on public.friend_requests for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can update received requests" on public.friend_requests;
create policy "Users can update received requests"
  on public.friend_requests for update
  using (auth.uid() = receiver_id or auth.uid() = sender_id);

drop policy if exists "Users can delete requests" on public.friend_requests;
create policy "Users can delete requests"
  on public.friend_requests for delete
  using (auth.uid() = sender_id or auth.uid() = receiver_id);


-- 9. MESSAGES / CHAT RLS
alter table public.messages enable row level security;

drop policy if exists "Messages are viewable by conversation participants" on public.messages;
create policy "Messages are viewable by conversation participants"
  on public.messages for select
  using (
    auth.uid() = sender_id or
    auth.uid() = receiver_id or
    community_id is not null
  );

drop policy if exists "Authenticated users can send messages" on public.messages;
create policy "Authenticated users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

drop policy if exists "Users can delete their own messages" on public.messages;
create policy "Users can delete their own messages"
  on public.messages for delete
  using (auth.uid() = sender_id);


-- ==============================================================================
-- SEED DATA: Required Campus Communities
-- ==============================================================================

insert into public.campus_communities (name, description, category)
values
  (
    'Coding & AI Club',
    'Build hackathon projects, learn open-source, debate LLMs, and pair program with fellow engineering students.',
    'Technology'
  ),
  (
    'Campus Creators',
    'Designers, photographers, video editors, and content makers collaborating across colleges and campuses.',
    'Creative & Arts'
  ),
  (
    'Placement Prep Circle',
    'DSA question sprints, mock technical & HR interviews, resume reviews, and internship referrals.',
    'Career & Growth'
  ),
  (
    'Study Buddies',
    'Find focused study partners for semester exams, share revision notes, and stay accountable together.',
    'Academics'
  )
on conflict (name) do update set
  description = excluded.description,
  category = excluded.category;

-- ==============================================================================
-- 10. REALTIME REPLICATION (For instant live Friend Requests, Chat, Feed updates)
-- ==============================================================================
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

-- Enable Realtime for friend_requests, messages, posts, likes, comments, follows, profiles
alter publication supabase_realtime add table public.friend_requests;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.profiles;
