-- Create service_categories table
create table if not exists public.service_categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    icon text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create services table
create table if not exists public.services (
    id uuid default gen_random_uuid() primary key,
    business_id uuid references auth.users(id) on delete cascade,
    category_id uuid references public.service_categories(id) on delete cascade,
    name text not null,
    description text,
    price decimal(10,2) not null,
    duration integer not null, -- in minutes
    image_url text,
    is_available boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create profiles table if not exists (extends auth.users)
create table if not exists public.profiles (
    id uuid references auth.users(id) on delete cascade primary key,
    role text not null check (role in ('business', 'customer')),
    business_name text,
    description text,
    location text,
    contact_number text,
    working_hours jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_categories enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using (true);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Services policies
create policy "Services are viewable by everyone"
    on public.services for select
    using (true);

create policy "Business owners can insert their own services"
    on public.services for insert
    with check (auth.uid() = business_id);

create policy "Business owners can update their own services"
    on public.services for update
    using (auth.uid() = business_id);

create policy "Business owners can delete their own services"
    on public.services for delete
    using (auth.uid() = business_id);

-- Service categories policies
create policy "Service categories are viewable by everyone"
    on public.service_categories for select
    using (true);

-- Create functions and triggers
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Add updated_at triggers
create trigger handle_updated_at_profiles
    before update on public.profiles
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at_services
    before update on public.services
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at_service_categories
    before update on public.service_categories
    for each row
    execute procedure public.handle_updated_at();
