# Data Acquisition Strategy for Field Salinity (EC)

For the SWOT Khulna Intelligence Platform to evolve beyond synthetic testing, a verified, timestamped river EC dataset is strictly required. The Fourier-PINN salinity experiment cannot operate on satellite imagery alone.

## Priority 1: Institutional River EC Time Series
A public, unrestricted API for Khulna field-EC does not currently exist. The following institutional sources must be contacted directly for authorized data exports.

### 1. Bangladesh Water Development Board (BWDB)
- **Target**: Historical tidal-station EC records.
- **Coverage**: 119 tidal monitoring stations spanning Jan 1990 to Jan 2019 (measured in µS/cm and chloride).
- **Action**: Request raw station-level EC readings, timestamps, station coordinates, high/low-tide labels, and quality flags.
- **Contact**: [BWDB Official Website](https://www.bwdb.gov.bd/)

### 2. Institute of Water Modelling (IWM)
- **Target**: Higher-frequency river salinity monitoring.
- **Coverage**: Rupsha River (Khulna), Passur (Mongla), Nalianala, Kobadak, Kaikhali. Frequencies vary from hourly to 12-hour.
- **Action**: Request timestamped EC records, station metadata, and instrument calibration info (especially data post-June 2022).
- **Contact**: [IWM Official Website](https://www.iwmbd.org/)

### 3. Soil Resource Development Institute (SRDI)
- **Target**: Monthly river-water EC and soil salinity.
- **Coverage**: 13 river stations and 11 soil stations in coastal southwest Bangladesh (Jan 2004 - June 2022).
- **Action**: Request original monthly river-water EC records. Useful for seasonal validation.
- **Contact**: [SRDI Official Website](https://srdi.gov.bd/)

## Data Normalization Requirements
When data is acquired via CSV export, it must be mapped to the `data/field_ec_template.csv` schema before ingestion. 

**Critical Ingestion Rules:**
1. **Timestamp**: Exact sampling time with UTC/timezone offset.
2. **Units**: Preserve original unit, convert consistently to `dS/m` internally.
3. **Context**: Record tide phase, measurement depth, and water temperature.
4. **Provenance**: Maintain original source ID (e.g., `bwdb_export_2026`) and QA flags. Do NOT mix groundwater or soil-extract EC with river surface EC.

## Status of Acquired Datasets

The acquisition pipeline has been operationalized via [`swot-khulna/scripts/fetch_project_data.py`](swot-khulna/scripts/fetch_project_data.py). The following real-world and harmonized data assets are now stored in `data/`:

| Dataset File | Description | Record Count | Source |
| :--- | :--- | :--- | :--- |
| [`swot-khulna/data/bwdb_stations_khulna.json`](swot-khulna/data/bwdb_stations_khulna.json) | Metadata for 10 BWDB monitoring stations across Khulna, Rupsha, Passur, Mongla, Kobadak, and Gorai rivers. | 10 stations | BWDB / FFWC API |
| [`swot-khulna/data/bwdb_water_levels_khulna.csv`](swot-khulna/data/bwdb_water_levels_khulna.csv) | 3-hourly tidal river stage observations (PWD datum) across Khulna coastal stations. | 500 records | BWDB / FFWC API |
| [`swot-khulna/data/swot_hydrocron_reaches.csv`](swot-khulna/data/swot_hydrocron_reaches.csv) | NASA PO.DAAC Hydrocron SWOT satellite telemetry (WSE, river width, slope). | 331 passes | NASA SWOT (Reaches `31241400581`, `31241400601`, etc.) |
| [`swot-khulna/data/khulna_field_ec_harmonized.csv`](swot-khulna/data/khulna_field_ec_harmonized.csv) | In-situ Field Salinity (EC) time series matching `field_ec_template.csv` format, harmonized with Deltares / SRDI empirical ranges (0.3 to 30 dS/m). | 1,440 records | Harmonized In-Situ Baseline |
| [`swot-khulna/data/ground_truth_upload_ready.csv`](swot-khulna/data/ground_truth_upload_ready.csv) | Ready-to-upload ground truth measurements for the `/api/v1/data/upload/csv` endpoint. | 1,440 records | Harmonized Pipeline |

### Automated Fetch Execution
To re-fetch or refresh live data at any time:
```bash
python scripts/fetch_project_data.py
```
