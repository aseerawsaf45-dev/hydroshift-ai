# HydroShift AI Operations Runbook

## Scientific Language & Disclaimers
All UI surfaces and reports must adhere to strict scientific disclaimers:
- PINN models and forecasts must be explicitly labeled as **"Experimental"** or **"Synthetic Projection"** until validated by local hydrological authorities.
- The UI must *never* interpolate data gaps in visualizations without explicit visual markings (e.g., dashed lines or translucent uncertainty bands).
- Ensure users cannot confuse raw PO.DAAC SWOT measurements with assimilated state estimations.

## Database Backups
Automated physical backups are scheduled daily via cron:
```bash
pg_dump -U swot_app -d khulna_salt_intrusion -F c -f /backups/khulna_salt_intrusion_$(date +%Y%m%d).dump
```

## Rollback Procedures
If a model deployment degrades performance or a database migration fails:
1. **API Rollback**: Revert to the previous Docker image tag in `compose.yaml` and restart via `docker compose up -d`.
2. **Database Rollback**:
   ```bash
   pg_restore -U swot_app -d khulna_salt_intrusion -1 /backups/khulna_salt_intrusion_previous.dump
   ```
3. **Model Rollback**: In the `/app/admin` UI, withdraw the current model version and set the previous PINN artifact state back to "Published".

## Source Failure (Hydrocron PO.DAAC)
If the PO.DAAC Hydrocron API experiences rate-limiting or an external outage:
1. The Data Hub `/data` dashboard will detect the failure and transition to `DEGRADED` or `OFFLINE`.
2. The UI will safely fall back to displaying the cached state from the `last_successful_sync`.
3. **Contingency**: If fresh observations are urgently required to prevent a forecast block, operators can manually ingest equivalent local station alternative telemetry via the Gauge CSV Upload Dropzone.

## Local Testing Environment
For rapid local iteration, the test suite falls back to a local SQLite database (`khulna.db`) to avoid requiring a full PostgreSQL instance. 
- To run the full scientific and API test suite locally, execute the powershell script:
  ```powershell
  .\run_tests.ps1
  ```
- This script automatically overrides the `DATABASE_URL` and `ENVIRONMENT` variables, ensuring tests are hermetic and do not mutate the production or staging PostgreSQL databases.
