import httpx
import os
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger(__name__)

HYDROCRON_BASE_URL = os.environ.get("HYDROCRON_BASE_URL", "https://soto.podaac.earthdatacloud.nasa.gov/hydrocron/v1/timeseries")
HYDROCRON_TIMEOUT = int(os.environ.get("HYDROCRON_TIMEOUT_SECONDS", "30"))

class HydrocronAdapter:
    def __init__(self, base_url: str = HYDROCRON_BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=HYDROCRON_TIMEOUT)
        
    async def check_health(self) -> bool:
        """Ping the hydrocron service or a small metadata endpoint to check live status."""
        try:
            # Query timeseries endpoint with a dummy check to verify connectivity
            response = await self.client.get(self.base_url, params={"feature": "Reach"}, timeout=5.0)
            # Hydrocron returns 400 when missing parameters, which indicates the service is alive and parsing
            return response.status_code in [200, 400]
        except Exception as e:
            logger.error(f"Hydrocron health check failed: {e}")
            return False

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        reraise=True
    )
    async def _fetch_page(self, url: str, params: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Fetching Hydrocron data from {url}")
        response = await self.client.get(url, params=params)
        response.raise_for_status()
        return response.json()

    async def fetch_reach_timeseries(
        self, 
        feature_id: str, 
        start_time: datetime, 
        end_time: datetime,
        fields: str = "reach_id,time_str,wse,width,slope2",
        collection_name: str = os.environ.get("SWOT_COLLECTION", "SWOT_L2_HR_RiverSP_D")
    ) -> List[Dict[str, Any]]:
        """Fetch SWOT reach observations from Hydrocron."""
        params = {
            "feature": "Reach",
            "feature_id": feature_id,
            "start_time": start_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end_time": end_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "output": "csv",
            "collection_name": collection_name,
            "fields": fields
        }
        
        results = []
        url = self.base_url
        
        try:
            data = await self._fetch_page(url, params)
            csv_str = data.get("results", {}).get("csv", "")
            if csv_str:
                import io
                import pandas as pd
                df = pd.read_csv(io.StringIO(csv_str))
                # Filter out missing/fill values
                if "wse" in df.columns:
                    df = df[df["wse"] > -100]
                results = df.to_dict(orient="records")
            return results
        except Exception as e:
            logger.error(f"Failed to fetch from Hydrocron for reach {feature_id}: {e}")
            raise
            
    async def close(self):
        await self.client.aclose()
