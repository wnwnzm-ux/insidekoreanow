-- ============================================================
-- InsideKoreaNow — restaurants table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

CREATE TABLE IF NOT EXISTS restaurants (
  id                BIGSERIAL PRIMARY KEY,
  name              TEXT NOT NULL,
  korean_name       TEXT,
  slug              TEXT,
  city              TEXT,
  district          TEXT,
  neighborhood      TEXT,

  -- Arrays (GIN-indexed for containment queries)
  food_type         TEXT[] DEFAULT '{}',
  travel_theme      TEXT[] DEFAULT '{}',
  vibe              TEXT[] DEFAULT '{}',
  best_for          TEXT[] DEFAULT '{}',
  tags              TEXT[] DEFAULT '{}',
  source_sheets     TEXT[] DEFAULT '{}',

  -- Location (flattened from nested JSON)
  price_level       TEXT,
  address           TEXT,
  address_ko        TEXT,
  lat               DOUBLE PRECISION,
  lng               DOUBLE PRECISION,

  -- Content
  description       TEXT,
  why_visit         TEXT,

  -- JSONB for structured sub-objects
  recommended_menu  JSONB DEFAULT '[]',   -- [{name, korean_name}, ...]
  extras            JSONB,                -- {별점, 시작연도, ...}

  -- Operational flags
  foreigner_friendly   BOOLEAN,
  reservation_needed   BOOLEAN,
  wait_time_level      TEXT,
  cashless_friendly    BOOLEAN,

  -- External
  maps_url          TEXT,
  rating_hint_ko    TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Unique index on slug (NULLs don't conflict) ─────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_slug
  ON restaurants (slug)
  WHERE slug IS NOT NULL;

-- ── Search indexes ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_restaurants_city
  ON restaurants (city);

CREATE INDEX IF NOT EXISTS idx_restaurants_district
  ON restaurants (district);

CREATE INDEX IF NOT EXISTS idx_restaurants_city_district
  ON restaurants (city, district);

CREATE INDEX IF NOT EXISTS idx_restaurants_food_type
  ON restaurants USING GIN (food_type);

CREATE INDEX IF NOT EXISTS idx_restaurants_tags
  ON restaurants USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_restaurants_travel_theme
  ON restaurants USING GIN (travel_theme);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Public read (anon key is safe for restaurant data)
CREATE POLICY "Public read access"
  ON restaurants FOR SELECT
  TO anon, authenticated
  USING (true);
