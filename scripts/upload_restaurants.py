import json
import os
import sys

from supabase import create_client

BATCH_SIZE = 100


def normalize_city(city):
    if not city:
        return city
    c = city.lower().replace(" ", "").replace("-", "")
    if "seoul" in c:
        return "Seoul"
    if "busan" in c:
        return "Busan"
    if "jeju" in c:
        return "Jeju"
    if "daegu" in c:
        return "Daegu"
    if "incheon" in c:
        return "Incheon"
    if "gwangju" in c:
        return "Gwangju"
    if "daejeon" in c:
        return "Daejeon"
    if "ulsan" in c:
        return "Ulsan"
    if "gyeonggi" in c:
        return "Gyeonggi-do"
    if "gangwon" in c:
        return "Gangwon-do"
    return city


def transform(r):
    loc = r.get("location") or {}
    coords = loc.get("coordinates") or {}
    return {
        "name": r["name"],
        "korean_name": r.get("korean_name"),
        "slug": r.get("slug") or None,
        "city": normalize_city(r.get("city")),
        "district": r.get("district"),
        "neighborhood": r.get("neighborhood"),
        "food_type": r.get("food_type") or [],
        "travel_theme": r.get("travel_theme") or [],
        "vibe": r.get("vibe") or [],
        "best_for": r.get("best_for") or [],
        "tags": r.get("tags") or [],
        "source_sheets": r.get("source_sheets") or [],
        "address": loc.get("address"),
        "address_ko": loc.get("address_ko"),
        "lat": coords.get("lat"),
        "lng": coords.get("lng"),
        "description": r.get("description"),
        "why_visit": r.get("why_visit"),
        "recommended_menu": r.get("recommended_menu") or [],
        "extras": r.get("extras"),
        "foreigner_friendly": r.get("foreigner_friendly"),
        "reservation_needed": r.get("reservation_needed"),
        "wait_time_level": r.get("wait_time_level"),
        "cashless_friendly": r.get("cashless_friendly"),
        "maps_url": r.get("maps_url"),
        "rating_hint_ko": r.get("rating_hint_ko"),
    }


def main():
    json_file = sys.argv[1] if len(sys.argv) > 1 else "restaurants_travel_db.json"

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY")
    if not url or not key:
        print("Error: set SUPABASE_URL and SUPABASE_SERVICE_KEY")
        sys.exit(1)

    print("Loading " + json_file)
    with open(json_file, encoding="utf-8") as f:
        data = json.load(f)
    print("Records: " + str(len(data)))

    client = create_client(url, key)
    rows = [transform(r) for r in data]

    success = 0
    failed = 0
    total = (len(rows) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        num = i // BATCH_SIZE + 1
        try:
            client.table("restaurants").insert(batch).execute()
            success += len(batch)
            print("Batch " + str(num) + "/" + str(total) + " OK  total=" + str(success))
        except Exception as e:
            print("Batch " + str(num) + " failed: " + str(e))
            for j, row in enumerate(batch):
                try:
                    client.table("restaurants").insert([row]).execute()
                    success += 1
                except Exception as e2:
                    failed += 1
                    print("  FAIL row " + str(i + j + 1) + " (" + str(row.get("name")) + "): " + str(e2))

    print("Done. success=" + str(success) + " failed=" + str(failed))


if __name__ == "__main__":
    main()
