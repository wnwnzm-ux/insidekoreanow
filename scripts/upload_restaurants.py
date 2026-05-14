#!/usr/bin/env python3
"""
Upload restaurants_travel_db.json to Supabase.

Prerequisites:
    pip install supabase

Usage:
    SUPABASE_URL=https://xxxx.supabase.co \
    SUPABASE_SERVICE_KEY=eyJ... \
    python scripts/upload_restaurants.py path/to/restaurants_travel_db.json

Options:
    --truncate   Clear the table before uploading (safe to re-run)
    --dry-run    Parse + transform only, no DB writes

City normalization: garbled city strings like "Bialkoria(seoulsi" are mapped
to canonical names (Seoul, Busan, Jeju, etc.) based on substring matching.
"""

import json
import os
import sys
import argparse

BATCH_SIZE = 100

# Substring → canonical city name (order matters: longer/more specific first)
CITY_PATTERNS = [
    ("seoulteukbyeolsi", "Seoul"),
    ("seoulsi", "Seoul"),
    ("seoul", "Seoul"),
    ("busansi", "Busan"),
    ("busan", "Busan"),
    ("jejudo", "Jeju"),
    ("jejusi", "Jeju"),
    ("jeju", "Jeju"),
    ("daegusi", "Daegu"),
    ("daegu", "Daegu"),
    ("incheonsi", "Incheon"),
    ("incheon", "Incheon"),
    ("gwangjusi", "Gwangju"),
    ("gwangju", "Gwangju"),
    ("daejeonsi", "Daejeon"),
    ("daejeon", "Daejeon"),
    ("ulsansi", "Ulsan"),
    ("ulsan", "Ulsan"),
    ("sejongsi", "Sejong"),
    ("sejong", "Sejong"),
    ("gyeonggido", "Gyeonggi-do"),
    ("gyeonggi", "Gyeonggi-do"),
    ("gangwondo", "Gangwon-do"),
    ("gangwon", "Gangwon-do"),
    ("chungcheongbukdo", "Chungcheongbuk-do"),
    ("chungcheongbuk", "Chungcheongbuk-do"),
    ("chungcheongnamdo", "Chungcheongnam-do"),
    ("chungcheongnam", "Chungcheongnam-do"),
    ("jeollabukdo", "Jeollabuk-do"),
    ("jeollabuk", "Jeollabuk-do"),
    ("jeollanamdo", "Jeollanam-do"),
    ("jeollanam", "Jeollanam-do"),
    ("gyeongsangbukdo", "Gyeongsangbuk-do"),
    ("gyeongsangbuk", "Gyeongsangbuk-do"),
    ("gyeongsangnamdo", "Gyeongsangnam-do"),
    ("gyeongsangnam", "Gyeongsangnam-do"),
    ("south korea", "South Korea"),
]


def normalize_city(city: str | None) -> str | None:
    if not city:
        return city
    lower = city.lower().replace(" ", "").replace("-", "")
    for pattern, canonical in CITY_PATTERNS:
        if pattern in lower:
            return canonical
    return city


def transform(record: dict) -> dict:
    loc = record.get("location") or {}
    coords = loc.get("coordinates") or {}
    return {
        "name": record["name"],
        "korean_name": record.get("korean_name"),
        "slug": record.get("slug") or None,
        "city": normalize_city(record.get("city")),
        "district": record.get("district"),
        "neighborhood": record.get("neighborhood"),
        "food_type": record.get("food_type") or [],
        "travel_theme": record.get("travel_theme") or [],
        "vibe": record.get("vibe") or [],
        "best_for": record.get("best_for") or [],
        "tags": record.get("tags") or [],
        "source_sheets": record.get("source_sheets") or [],
        "price_level": record.get("price_level"),
        "address": loc.get("address"),
        "address_ko": loc.get("address_ko"),
        "lat": coords.get("lat"),
        "lng": coords.get("lng"),
        "description": record.get("description"),
        "why_visit": record.get("why_visit"),
        "recommended_menu": record.get("recommended_menu") or [],
        "extras": record.get("extras"),
        "foreigner_friendly": record.get("foreigner_friendly"),
        "reservation_needed": record.get("reservation_needed"),
        "wait_time_level": record.get("wait_time_level"),
        "cashless_friendly": record.get("cashless_friendly"),
        "maps_url": record.get("maps_url"),
        "rating_hint_ko": record.get("rating_hint_ko"),
    }


def main():
    parser = argparse.ArgumentParser(description="Upload restaurants to Supabase")
    parser.add_argument("json_file", nargs="?", default="restaurants_travel_db.json")
    parser.add_argument("--truncate", action="store_true", help="Clear table before upload")
    parser.add_argument("--dry-run", action="store_true", help="Parse only, no DB writes")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")

    if not args.dry_run and (not url or not key):
        print("Error: set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables")
        sys.exit(1)

    print(f"Loading {args.json_file} …")
    with open(args.json_file, encoding="utf-8") as f:
        data = json.load(f)
    print(f"Loaded {len(data):,} records")

    rows = [transform(r) for r in data]
    print(f"Transformed {len(rows):,} rows")

    if args.dry_run:
        print("Dry run — sample of first 3 rows:")
        for r in rows[:3]:
            print(json.dumps(r, ensure_ascii=False, indent=2))
        return

    from supabase import create_client  # import here so --dry-run works without the package

    client = create_client(url, key)

    if args.truncate:
        confirm = input("⚠️  This will delete all existing restaurants. Type 'yes' to confirm: ")
        if confirm.strip().lower() != "yes":
            print("Aborted.")
            return
        client.table("restaurants").delete().neq("id", 0).execute()
        print("Table cleared.")

    success = 0
    failed = 0
    total_batches = (len(rows) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1

        try:
            client.table("restaurants").upsert(batch, on_conflict="slug").execute()
            success += len(batch)
            print(f"Batch {batch_num}/{total_batches}: {len(batch)} rows OK  (total {success:,})")
        except Exception as bulk_err:
            print(f"Batch {batch_num} failed ({bulk_err}), retrying one-by-one …")
            for j, row in enumerate(batch):
                try:
                    client.table("restaurants").upsert([row], on_conflict="slug").execute()
                    success += 1
                except Exception as row_err:
                    failed += 1
                    print(f"  ✗ row {i + j + 1} ({row.get('name')}): {row_err}")

    print(f"\nDone — success: {success:,}  failed: {failed:,}")
    if failed:
        print("Tip: failed rows are usually duplicates or rows with null slugs that already exist.")


if __name__ == "__main__":
    main()
