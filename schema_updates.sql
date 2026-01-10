-- Create Analytics Visits Table
create table if not exists analytics_visits (
  id uuid default gen_random_uuid() primary key,
  ip_address text,
  country text,
  city text,
  page_url text,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Add indexes for better query performance
create index if not exists idx_analytics_visits_created_at on analytics_visits(created_at);
create index if not exists idx_analytics_visits_country on analytics_visits(country);

-- Modify Payment Settings to include 'is_active' and new method
alter table payment_settings 
add column if not exists is_active boolean default true;

-- Ensure InstaPay exists in allowed methods (this is more for consistency, as rows are upserted by the app)
-- However, we can pre-seed if checking strictly
-- No strict enum constraint found in code, so we rely on app logic.
