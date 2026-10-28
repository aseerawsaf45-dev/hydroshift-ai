"""
Download SWOT RiverSP reach time series from PO.DAAC Hydrocron.
SWORD (SWOT River Database) reach identifiers along the Passur-Rupsha-Gorai network:
- 31241400581: Khulna City / Madhukhali Intake Reach
- 31241400601: Mongla Port Reach
- 31241400561: Dacope / Chalna Reach
- 31241000011: Lower Passur Estuary
"""
import io
import os
import sys
import pandas as pd
import requests

URL = "https://soto.podaac.earthdatacloud.nasa.gov/hydrocron/v1/timeseries"
DEFAULT_REACHES = ["31241400581", "31241400601", "31241400561", "31241000011"]

ACTIVE_COLLECTION = os.environ.get("SWOT_COLLECTION", "SWOT_L2_HR_RiverSP_D")
FALLBACK_COLLECTION = "SWOT_L2_HR_RiverSP_2.0"

def fetch(reach_id: str, start: str = "2023-08-01T00:00:00Z", end: str = "2026-10-29T00:00:00Z", collection: str = ACTIVE_COLLECTION) -> pd.DataFrame:
    try:
        r = requests.get(
            URL,
            params=dict(
                feature="Reach",
                feature_id=reach_id,
                start_time=start,
                end_time=end,
                output="csv",
                fields="reach_id,time_str,wse,width,slope2,reach_q",
                collection_name=collection
            ),
            timeout=60
        )
        r.raise_for_status()
    except Exception as e:
        if collection != FALLBACK_COLLECTION:
            print(f"Collection {collection} request returned {e}. Retrying with historical baseline {FALLBACK_COLLECTION}...")
            return fetch(reach_id, start, end, collection=FALLBACK_COLLECTION)
        raise e
    df = pd.read_csv(io.StringIO(r.text))
    # SWOT fill values are huge negatives (e.g. -999999999999) -> drop them
    if "wse" in df.columns:
        df = df[df.wse > -1e6]
    return df

if __name__ == "__main__":
    reaches = sys.argv[1:] or DEFAULT_REACHES
    os.makedirs("data", exist_ok=True)
    frames = []
    for r in reaches:
        try:
            print(f"Fetching SWORD Reach {r} from PO.DAAC Hydrocron...")
            df = fetch(r)
            if not df.empty:
                frames.append(df)
                print(f"  Received {len(df)} records for reach {r}")
        except Exception as e:
            print(f"  Error fetching reach {r}: {e}")

    if frames:
        out = pd.concat(frames, ignore_index=True)
        out_csv = "data/swot_hydrocron_reaches.csv"
        out.to_csv(out_csv, index=False)
        print(f"Saved {len(out)} total records to {out_csv}")
        if "reach_id" in out.columns:
            print(out.groupby("reach_id").size())
    else:
        print("No reach data retrieved.")
