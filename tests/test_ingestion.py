import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
import uuid
import datetime

client = TestClient(app)

def test_csv_upload_idempotency():
    """Verify that uploading a CSV is idempotent (creates 0 new rows on second run)."""
    
    # We must ensure the site exists first, due to the ForeignKey on site_id
    # We can either mock the DB or create a dummy site if possible.
    # For this test, we will create a dummy site directly if it doesn't exist.
    # Note: Using TestClient against real DB needs careful teardown, but since we use
    # UUIDs, we can just use a unique site_id for the test.
    
    test_site_id = f"test-site-{uuid.uuid4()}"
    test_timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    # 1. Create a dummy site to satisfy foreign key constraints in PostgreSQL
    from services.api.app.db.session import SessionLocal
    from services.api.app.db.models import Site
    with SessionLocal() as db:
        dummy_site = Site(id=test_site_id, name="Test Ingestion Site", latitude=22.5, longitude=89.5)
        db.add(dummy_site)
        db.commit()
    
    csv_content = f"site_id,timestamp,target_variable,value,unit,medium,source,measurement_method,quality_flag\n" \
                  f"{test_site_id},{test_timestamp},salinity,12.5,ppt,water,test_source,sensor,1\n" \
                  f"{test_site_id},{test_timestamp},EC,1.8,dS/m,water,test_source,sensor,1\n"
    
    # First upload
    response1 = client.post(
        "/api/v1/data/upload/csv",
        files={"file": ("test_data.csv", csv_content, "text/csv")}
    )
    
    assert response1.status_code == 200
    data1 = response1.json()
    assert data1["status"] == "completed"
    assert "Inserted 2 rows" in data1["message"]
    
    # Second upload (same data)
    response2 = client.post(
        "/api/v1/data/upload/csv",
        files={"file": ("test_data.csv", csv_content, "text/csv")}
    )
    
    assert response2.status_code == 200
    data2 = response2.json()
    assert data2["status"] == "completed"
    assert "Inserted 0 rows" in data2["message"]
    assert "skipped 2 existing rows" in data2["message"]
