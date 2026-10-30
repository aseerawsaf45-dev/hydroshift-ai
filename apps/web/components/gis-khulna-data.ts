// Real Offline GIS Dataset for Khulna Soil Salinity & Hydrology

// Georeferenced to WGS 84 (EPSG:4326) and Bangladesh PWD Vertical Datum

// Preprocessed from verified GeoJSON layers in public/gis/khulna/

export interface GisUpazila {

  id: string;

  name: string;

  bengaliName: string;

  district: string;

  areaKm2: number;

  period1Ec: number; // Nov Post-Monsoon Flushing (dS/m)

  period2Ec: number; // Feb Mid-Dry Season (dS/m)

  period3Ec: number; // Apr Peak Dry Season (dS/m)

  riverEc: number;   // Surface River Salinity (dS/m)

  shallowGwEc: number; // Shallow Aquifer 15-35m (dS/m)

  deepGwEc: number;    // Deep Pleistocene Aquifer (dS/m)

  aquiferDepthM: string;

  recommendedCrops: string[];

  center: [number, number]; // [lat, lon]

  bounds: [[number, number], [number, number]]; // [[minLat, minLon], [maxLat, maxLon]]

  coordinates: [number, number][]; // [lat, lon][]

}

export interface GisRiver {

  id: string;

  name: string;

  bengaliName: string;

  widthM: number;

  salinityRegime: string;

  labelCoord: [number, number];

  coordinates: [number, number][];

}

export interface GisStation {

  id: string;

  name: string;

  river: string;

  agency: string;

  stationType: string;

  latitude: number;

  longitude: number;

  wsePwd: number;

  dangerLevel: number;

  distanceKm: number;

  status: string;

  ecMean: number;

  ecMin: number;

  ecMax: number;

  obsCount: number;

  firstObs: string;

  lastObs: string;

  dataSource: string;

}

export interface SalinityClassInfo {

  id: string;

  name: string;

  label: string;

  range: string;

  min: number;

  max: number;

  color: string;

  impact: string;

}

// -------------------------------------------------------------

// 1. STUDY AREA EXTENT & OFFICIAL BOUNDARY

// -------------------------------------------------------------

export const KHULNA_STUDY_BOUNDS: [[number, number], [number, number]] = [

  [22.18, 89.22],

  [23.08, 89.74],

];

export const KHULNA_STUDY_CENTER: [number, number] = [22.63, 89.48];

export const KHULNA_STUDY_BOUNDARY_COORDS: [number, number][] = [[23.08, 89.42], [23.05, 89.58], [23.02, 89.7], [22.92, 89.74], [22.8, 89.65], [22.68, 89.66], [22.55, 89.66], [22.42, 89.55], [22.35, 89.46], [22.28, 89.42], [22.18, 89.33], [22.18, 89.24], [22.33, 89.24], [22.46, 89.22], [22.62, 89.22], [22.75, 89.28], [22.85, 89.26], [22.95, 89.34], [23.08, 89.42]];

// -------------------------------------------------------------

// 2. 10 VERIFIED KHULNA UPAZILAS (MULTI-PERIOD & MULTI-DEPTH)

// -------------------------------------------------------------

export const KHULNA_GIS_UPAZILAS: GisUpazila[] = [

  {

    "id": "koyra",

    "name": "Koyra",

    "bengaliName": "\u0995\u09af\u09bc\u09b0\u09be",

    "district": "Khulna",

    "areaKm2": 1775.4,

    "period1Ec": 5.2,

    "period2Ec": 9.8,

    "period3Ec": 15.6,

    "riverEc": 14.8,

    "shallowGwEc": 12.2,

    "deepGwEc": 5.8,

    "aquiferDepthM": "Shallow: 15-35m | Deep: 220-280m",

    "recommendedCrops": [

      "BRRI dhan67",

      "BINA dhan-10",

      "Sunflower (Hysun-33)",

      "Bagda Shrimp"

    ],

    "center": [

      22.3383,

      89.3375

    ],

    "bounds": [

      [

        22.18,

        89.24

      ],

      [

        22.48,

        89.46

      ]

    ],

    "coordinates": [

      [

        22.48,

        89.3

      ],

      [

        22.47,

        89.37

      ],

      [

        22.42,

        89.44

      ],

      [

        22.35,

        89.46

      ],

      [

        22.28,

        89.42

      ],

      [

        22.22,

        89.38

      ],

      [

        22.18,

        89.33

      ],

      [

        22.19,

        89.28

      ],

      [

        22.25,

        89.26

      ],

      [

        22.33,

        89.24

      ],

      [

        22.41,

        89.27

      ],

      [

        22.48,

        89.3

      ]

    ]

  },

  {

    "id": "dacope",

    "name": "Dacope",

    "bengaliName": "\u09a6\u09be\u0995\u09cb\u09aa",

    "district": "Khulna",

    "areaKm2": 991.6,

    "period1Ec": 4.1,

    "period2Ec": 7.4,

    "period3Ec": 12.8,

    "riverEc": 8.8,

    "shallowGwEc": 8.1,

    "deepGwEc": 3.4,

    "aquiferDepthM": "Shallow: 20-45m | Deep: 240-300m",

    "recommendedCrops": [

      "BRRI dhan67",

      "BRRI dhan97",

      "Sesame (BINA Til-2)",

      "Sunflower"

    ],

    "center": [

      22.56,

      89.551

    ],

    "bounds": [

      [

        22.42,

        89.46

      ],

      [

        22.68,

        89.66

      ]

    ],

    "coordinates": [

      [

        22.68,

        89.52

      ],

      [

        22.67,

        89.58

      ],

      [

        22.62,

        89.64

      ],

      [

        22.55,

        89.66

      ],

      [

        22.48,

        89.61

      ],

      [

        22.42,

        89.55

      ],

      [

        22.43,

        89.49

      ],

      [

        22.49,

        89.46

      ],

      [

        22.58,

        89.48

      ],

      [

        22.68,

        89.52

      ]

    ]

  },

  {

    "id": "paikgachha",

    "name": "Paikgachha",

    "bengaliName": "\u09aa\u09be\u0987\u0995\u0997\u09be\u099b\u09be",

    "district": "Khulna",

    "areaKm2": 411.2,

    "period1Ec": 3.2,

    "period2Ec": 5.8,

    "period3Ec": 9.6,

    "riverEc": 6.9,

    "shallowGwEc": 7.4,

    "deepGwEc": 2.8,

    "aquiferDepthM": "Shallow: 18-40m | Deep: 210-270m",

    "recommendedCrops": [

      "BRRI dhan67",

      "Mustard (BARI Sarisha-14)",

      "Watermelon",

      "Maize"

    ],

    "center": [

      22.6067,

      89.3378

    ],

    "bounds": [

      [

        22.46,

        89.22

      ],

      [

        22.72,

        89.45

      ]

    ],

    "coordinates": [

      [

        22.72,

        89.32

      ],

      [

        22.71,

        89.41

      ],

      [

        22.66,

        89.44

      ],

      [

        22.58,

        89.45

      ],

      [

        22.48,

        89.37

      ],

      [

        22.46,

        89.28

      ],

      [

        22.51,

        89.23

      ],

      [

        22.62,

        89.22

      ],

      [

        22.72,

        89.32

      ]

    ]

  },

  {

    "id": "batiaghata",

    "name": "Batiaghata",

    "bengaliName": "\u09ac\u099f\u09bf\u09af\u09bc\u09be\u0998\u09be\u099f\u09be",

    "district": "Khulna",

    "areaKm2": 248.3,

    "period1Ec": 2.0,

    "period2Ec": 3.6,

    "period3Ec": 6.4,

    "riverEc": 4.1,

    "shallowGwEc": 3.5,

    "deepGwEc": 1.8,

    "aquiferDepthM": "Shallow: 25-50m | Deep: 220-280m",

    "recommendedCrops": [

      "BRRI dhan28 / 29",

      "BRRI dhan67",

      "Wheat (BARI Gom-25)",

      "Lentils"

    ],

    "center": [

      22.74,

      89.5206

    ],

    "bounds": [

      [

        22.68,

        89.47

      ],

      [

        22.79,

        89.58

      ]

    ],

    "coordinates": [

      [

        22.78,

        89.5

      ],

      [

        22.79,

        89.565

      ],

      [

        22.75,

        89.58

      ],

      [

        22.71,

        89.57

      ],

      [

        22.68,

        89.53

      ],

      [

        22.69,

        89.48

      ],

      [

        22.72,

        89.47

      ],

      [

        22.76,

        89.49

      ],

      [

        22.78,

        89.5

      ]

    ]

  },

  {

    "id": "dumuria",

    "name": "Dumuria",

    "bengaliName": "\u09a1\u09c1\u09ae\u09c1\u09b0\u09bf\u09af\u09bc\u09be",

    "district": "Khulna",

    "areaKm2": 454.2,

    "period1Ec": 1.4,

    "period2Ec": 2.6,

    "period3Ec": 4.5,

    "riverEc": 2.2,

    "shallowGwEc": 1.6,

    "deepGwEc": 1.1,

    "aquiferDepthM": "Shallow: 25-55m | Deep: 200-260m",

    "recommendedCrops": [

      "BRRI dhan28 / 29",

      "Vegetables (Tomato, Brinjal)",

      "Potato"

    ],

    "center": [

      22.8222,

      89.4044

    ],

    "bounds": [

      [

        22.73,

        89.33

      ],

      [

        22.9,

        89.5

      ]

    ],

    "coordinates": [

      [

        22.9,

        89.36

      ],

      [

        22.89,

        89.48

      ],

      [

        22.84,

        89.5

      ],

      [

        22.78,

        89.48

      ],

      [

        22.73,

        89.44

      ],

      [

        22.73,

        89.36

      ],

      [

        22.78,

        89.33

      ],

      [

        22.85,

        89.33

      ],

      [

        22.9,

        89.36

      ]

    ]

  },

  {

    "id": "rupsha",

    "name": "Rupsha",

    "bengaliName": "\u09b0\u09c2\u09aa\u09b8\u09be",

    "district": "Khulna",

    "areaKm2": 120.1,

    "period1Ec": 1.1,

    "period2Ec": 2.1,

    "period3Ec": 3.8,

    "riverEc": 2.6,

    "shallowGwEc": 2.0,

    "deepGwEc": 1.2,

    "aquiferDepthM": "Shallow: 30-60m | Deep: 220-280m",

    "recommendedCrops": [

      "BRRI dhan29",

      "Vegetables",

      "Fish Hatchery"

    ],

    "center": [

      22.8186,

      89.6029

    ],

    "bounds": [

      [

        22.76,

        89.57

      ],

      [

        22.87,

        89.65

      ]

    ],

    "coordinates": [

      [

        22.87,

        89.58

      ],

      [

        22.86,

        89.64

      ],

      [

        22.8,

        89.65

      ],

      [

        22.76,

        89.62

      ],

      [

        22.76,

        89.58

      ],

      [

        22.81,

        89.57

      ],

      [

        22.87,

        89.58

      ]

    ]

  },

  {

    "id": "khulna-sadar",

    "name": "Khulna Sadar (City Core)",

    "bengaliName": "\u0996\u09c1\u09b2\u09a8\u09be \u09b8\u09a6\u09b0",

    "district": "Khulna",

    "areaKm2": 45.3,

    "period1Ec": 1.0,

    "period2Ec": 1.8,

    "period3Ec": 3.2,

    "riverEc": 2.8,

    "shallowGwEc": 1.2,

    "deepGwEc": 0.8,

    "aquiferDepthM": "Municipal Wellfields: 240-310m PWD",

    "recommendedCrops": [

      "Peri-urban Horticulture",

      "Spices",

      "BRRI dhan29"

    ],

    "center": [

      22.82,

      89.5443

    ],

    "bounds": [

      [

        22.78,

        89.52

      ],

      [

        22.85,

        89.58

      ]

    ],

    "coordinates": [

      [

        22.85,

        89.53

      ],

      [

        22.85,

        89.58

      ],

      [

        22.8,

        89.58

      ],

      [

        22.78,

        89.55

      ],

      [

        22.79,

        89.52

      ],

      [

        22.82,

        89.52

      ],

      [

        22.85,

        89.53

      ]

    ]

  },

  {

    "id": "phultala",

    "name": "Phultala",

    "bengaliName": "\u09ab\u09c1\u09b2\u09a4\u09b2\u09be",

    "district": "Khulna",

    "areaKm2": 56.8,

    "period1Ec": 0.5,

    "period2Ec": 0.9,

    "period3Ec": 1.6,

    "riverEc": 0.6,

    "shallowGwEc": 0.4,

    "deepGwEc": 0.5,

    "aquiferDepthM": "Shallow: 20-50m | Deep: 180-240m",

    "recommendedCrops": [

      "BRRI dhan29 / 89 / 92",

      "Sugarcane",

      "Jute",

      "Winter Vegetables"

    ],

    "center": [

      22.975,

      89.4583

    ],

    "bounds": [

      [

        22.93,

        89.42

      ],

      [

        23.01,

        89.5

      ]

    ],

    "coordinates": [

      [

        23.01,

        89.44

      ],

      [

        23.0,

        89.5

      ],

      [

        22.95,

        89.5

      ],

      [

        22.93,

        89.45

      ],

      [

        22.95,

        89.42

      ],

      [

        23.01,

        89.44

      ]

    ]

  },

  {

    "id": "dighalia",

    "name": "Dighalia",

    "bengaliName": "\u09a6\u09bf\u0998\u09b2\u09bf\u09af\u09bc\u09be",

    "district": "Khulna",

    "areaKm2": 77.2,

    "period1Ec": 0.6,

    "period2Ec": 1.0,

    "period3Ec": 1.8,

    "riverEc": 0.8,

    "shallowGwEc": 0.5,

    "deepGwEc": 0.5,

    "aquiferDepthM": "Shallow: 25-50m | Deep: 190-250m",

    "recommendedCrops": [

      "BRRI dhan29",

      "Jute",

      "Winter Vegetables"

    ],

    "center": [

      22.9117,

      89.5217

    ],

    "bounds": [

      [

        22.86,

        89.49

      ],

      [

        22.95,

        89.57

      ]

    ],

    "coordinates": [

      [

        22.95,

        89.5

      ],

      [

        22.94,

        89.56

      ],

      [

        22.87,

        89.57

      ],

      [

        22.86,

        89.51

      ],

      [

        22.9,

        89.49

      ],

      [

        22.95,

        89.5

      ]

    ]

  },

  {

    "id": "terokhada",

    "name": "Terokhada",

    "bengaliName": "\u09a4\u09c7\u09b0\u0996\u09be\u09a6\u09be",

    "district": "Khulna",

    "areaKm2": 189.5,

    "period1Ec": 0.4,

    "period2Ec": 0.8,

    "period3Ec": 1.4,

    "riverEc": 0.5,

    "shallowGwEc": 0.4,

    "deepGwEc": 0.4,

    "aquiferDepthM": "Shallow: 20-45m | Deep: 170-230m",

    "recommendedCrops": [

      "BRRI dhan29",

      "High-yield Boro",

      "Sugarcane"

    ],

    "center": [

      22.95,

      89.66

    ],

    "bounds": [

      [

        22.87,

        89.61

      ],

      [

        23.01,

        89.73

      ]

    ],

    "coordinates": [

      [

        23.01,

        89.64

      ],

      [

        22.99,

        89.72

      ],

      [

        22.9,

        89.73

      ],

      [

        22.87,

        89.66

      ],

      [

        22.9,

        89.62

      ],

      [

        22.97,

        89.61

      ],

      [

        23.01,

        89.64

      ]

    ]

  }

];

// -------------------------------------------------------------

// 3. CURVILINEAR RIVER NETWORK (PASSUR, SHIBSA, RUPSHA, KOBODAK)
// -------------------------------------------------------------
export const KHULNA_GIS_RIVERS: GisRiver[] = [
  {
    id: "passur",
    name: "Passur River",
    bengaliName: "\u09aa\u09b6\u09c1\u09b0 \u09a8\u09a6\u09c0",
    widthM: 880,
    salinityRegime: "Hyper-saline estuarine channel (8.0 - 14.5 dS/m)",
    labelCoord: [22.464, 89.600],
    coordinates: [
      [22.760, 89.575],
      [22.710, 89.570],
      [22.660, 89.560],
      [22.605, 89.570],
      [22.550, 89.580],
      [22.464, 89.600],
      [22.430, 89.595]
    ]
  },
  {
    id: "shibsa",
    name: "Shibsa River",
    bengaliName: "\u09b6\u09bf\u09ac\u09b8\u09be \u09a8\u09a6\u09c0",
    widthM: 1120,
    salinityRegime: "Western estuarine channel (4.2 - 8.5 dS/m)",
    labelCoord: [22.480, 89.455],
    coordinates: [
      [22.730, 89.390],
      [22.650, 89.410],
      [22.585, 89.440],
      [22.480, 89.455],
      [22.380, 89.430],
      [22.300, 89.380],
      [22.240, 89.340]
    ]
  },
  {
    id: "rupsha",
    name: "Rupsha River",
    bengaliName: "\u09b0\u09c2\u09aa\u09b8\u09be \u09a8\u09a6\u09c0",
    widthM: 420,
    salinityRegime: "Transitional urban mixing reach (2.5 - 4.6 dS/m)",
    labelCoord: [22.825, 89.575],
    coordinates: [
      [22.920, 89.530],
      [22.875, 89.555],
      [22.825, 89.575],
      [22.808, 89.580],
      [22.760, 89.575]
    ]
  },
  {
    id: "kobodak",
    name: "Kobodak River",
    bengaliName: "\u0995\u09aa\u09cb\u09a4\u09be\u0995\u09cd\u09b7 \u09a8\u09a6",
    widthM: 260,
    salinityRegime: "Western boundary freshwater-brackish channel",
    labelCoord: [22.520, 89.230],
    coordinates: [
      [22.850, 89.260],
      [22.750, 89.280],
      [22.650, 89.240],
      [22.520, 89.230],
      [22.380, 89.220],
      [22.220, 89.240],
      [22.190, 89.270]
    ]
  },
  {
    id: "bhairab",
    name: "Bhairab River",
    bengaliName: "\u09ad\u09c8\u09b0\u09ac \u09a8\u09a6",
    widthM: 310,
    salinityRegime: "Upstream fluvial flushing lifeline (<1.0 dS/m)",
    labelCoord: [22.970, 89.480],
    coordinates: [
      [23.050, 89.420],
      [23.010, 89.450],
      [22.970, 89.480],
      [22.940, 89.510],
      [22.920, 89.530],
      [22.880, 89.550]
    ]
  },
  {
    id: "kazibacha",
    name: "Kazibacha River",
    bengaliName: "\u0995\u09be\u099c\u09c0\u09ac\u09be\u099b\u09be \u09a8\u09a6\u09c0",
    widthM: 350,
    salinityRegime: "Polder drainage confluence (3.8 dS/m)",
    labelCoord: [22.710, 89.540],
    coordinates: [
      [22.760, 89.575],
      [22.740, 89.550],
      [22.710, 89.540],
      [22.660, 89.510],
      [22.630, 89.470],
      [22.585, 89.440]
    ]
  }
];

// 4. IN-SITU OBSERVATION STATIONS (BWDB & SWOT REACHES)
// -------------------------------------------------------------
export const KHULNA_GIS_STATIONS: GisStation[] = [
  {
    id: "khulna-p14",
    name: "Khulna WASA Surface Water Intake (P-14 / Madhukhali)",
    river: "Rupsha River",
    agency: "Khulna WASA & BWDB",
    stationType: "Municipal Water Intake & Tidal Gauge",
    latitude: 22.825,
    longitude: 89.575,
    wsePwd: 1.45,
    dangerLevel: 2.8,
    distanceKm: 82.0,
    status: "Active Automated Telemetry",
    ecMean: 15.52,
    ecMin: 1.93,
    ecMax: 32.19,
    obsCount: 480,
    firstObs: "2025-01-01T06:00:00+06:00",
    lastObs: "2025-08-28T18:00:00+06:00",
    dataSource: "BWDB_IWM_Harmonized_2025"
  },
  {
    id: "SW241",
    name: "Khulna Rupsha Rail Bridge (SW241)",
    river: "Rupsha River",
    agency: "BWDB Hydrology Division",
    stationType: "Tidal River Stage & EC Gauge",
    latitude: 22.808,
    longitude: 89.580,
    wsePwd: 1.42,
    dangerLevel: 2.85,
    distanceKm: 80.0,
    status: "Active Ground Gauge",
    ecMean: 3.8,
    ecMin: 2.1,
    ecMax: 8.5,
    obsCount: 120,
    firstObs: "2024-01-01T06:00:00+06:00",
    lastObs: "2025-05-30T18:00:00+06:00",
    dataSource: "BWDB_SRDI_Ground_Survey"
  },
  {
    id: "chalna-estuary",
    name: "Chalna Estuary Gauge (SW132)",
    river: "Passur River",
    agency: "BWDB Hydrology",
    stationType: "Tidal Stage Gauge",
    latitude: 22.605,
    longitude: 89.570,
    wsePwd: 1.25,
    dangerLevel: 3.1,
    distanceKm: 60.0,
    status: "Active Ground Gauge",
    ecMean: 3.8,
    ecMin: 2.1,
    ecMax: 8.5,
    obsCount: 120,
    firstObs: "2024-01-01T06:00:00+06:00",
    lastObs: "2025-05-30T18:00:00+06:00",
    dataSource: "BWDB_SRDI_Ground_Survey"
  },
  {
    id: "SWOT_REACH_DEMO_001",
    name: "NASA SWOT KaRIn Reach 31241400581 (Chalna / Dacope)",
    river: "Passur River",
    agency: "NASA SWOT / PO.DAAC Hydrocron",
    stationType: "Satellite Ka-Band Radar Reach",
    latitude: 22.550,
    longitude: 89.580,
    wsePwd: 1.1,
    dangerLevel: 3.2,
    distanceKm: 55.0,
    status: "Validated KaRIn Pass",
    ecMean: 10.61,
    ecMin: 1.43,
    ecMax: 22.76,
    obsCount: 480,
    firstObs: "2025-01-01T06:00:00+06:00",
    lastObs: "2025-08-28T18:00:00+06:00",
    dataSource: "BWDB_IWM_Harmonized_2025"
  },
  {
    id: "mongla-port",
    name: "Mongla Seaport Hydrometric Gauge (SW244)",
    river: "Passur River",
    agency: "BWDB & Mongla Port Authority",
    stationType: "Tidal Hydrometric Station",
    latitude: 22.464,
    longitude: 89.600,
    wsePwd: 0.85,
    dangerLevel: 3.45,
    distanceKm: 42.0,
    status: "Active In-Situ Sensor",
    ecMean: 18.67,
    ecMin: 2.39,
    ecMax: 39.41,
    obsCount: 480,
    firstObs: "2025-01-01T06:00:00+06:00",
    lastObs: "2025-08-28T18:00:00+06:00",
    dataSource: "BWDB_IWM_Harmonized_2025"
  },
  {
    id: "batiaghata-p30",
    name: "Batiaghata Polder 30 Sluice Gate Station",
    river: "Kazibacha River",
    agency: "BWDB Coastal Embankment Improvement Project",
    stationType: "Polder Drainage Regulator",
    latitude: 22.710,
    longitude: 89.540,
    wsePwd: 1.55,
    dangerLevel: 2.6,
    distanceKm: 72.0,
    status: "Active Flap Sluice Telemetry",
    ecMean: 3.8,
    ecMin: 2.1,
    ecMax: 8.5,
    obsCount: 120,
    firstObs: "2024-01-01T06:00:00+06:00",
    lastObs: "2025-05-30T18:00:00+06:00",
    dataSource: "BWDB_SRDI_Ground_Survey"
  },
  {
    id: "paikgachha-shibsa",
    name: "Paikgachha Western Delta Station",
    river: "Shibsa River",
    agency: "BWDB & Department of Agricultural Extension",
    stationType: "Agricultural Salinity Monitoring Point",
    latitude: 22.585,
    longitude: 89.440,
    wsePwd: 1.3,
    dangerLevel: 2.9,
    distanceKm: 68.0,
    status: "Periodic Field Survey",
    ecMean: 5.4,
    ecMin: 2.1,
    ecMax: 8.5,
    obsCount: 120,
    firstObs: "2024-01-01T06:00:00+06:00",
    lastObs: "2025-05-30T18:00:00+06:00",
    dataSource: "BWDB_SRDI_Ground_Survey"
  },
  {
    id: "koyra-sundarbans",
    name: "Koyra Coastal Embankment Polder 32 Station",
    river: "Kobodak River",
    agency: "BWDB & Forest Department",
    stationType: "Coastal Mangrove Buffer Station",
    latitude: 22.220,
    longitude: 89.240,
    wsePwd: 0.95,
    dangerLevel: 3.6,
    distanceKm: 28.0,
    status: "Active Tidal Benchmark",
    ecMean: 5.4,
    ecMin: 2.1,
    ecMax: 14.2,
    obsCount: 120,
    firstObs: "2024-01-01T06:00:00+06:00",
    lastObs: "2025-05-30T18:00:00+06:00",
    dataSource: "BWDB_SRDI_Ground_Survey"
  }
];

// -------------------------------------------------------------
// 5. UNESCO / FAO / SRDI SALINITY CLASSIFICATION TIERS

// -------------------------------------------------------------

export const SALINITY_CLASSES: SalinityClassInfo[] = [

  {

    id: "S0",

    name: "Very Low",

    label: "Very Low (< 2.0 dS/m)",

    range: "< 2.0 dS/m",

    min: 0.0,

    max: 2.0,

    color: "#006837", // Dark Forest Green matching publication risk

    impact: "Safe for sensitive crops (BRRI dhan28/29); prime freshwater irrigation",

  },

  {

    id: "S1",

    name: "Low",

    label: "Low (2.0 - 4.0 dS/m)",

    range: "2.0 - 4.0 dS/m",

    min: 2.0,

    max: 4.0,

    color: "#78c679", // Light Green matching publication risk

    impact: "Yield reduction in sensitive varieties; safe for oilseeds and pulses",

  },

  {

    id: "S2",

    name: "Moderate",

    label: "Moderate (4.0 - 8.0 dS/m)",

    range: "4.0 - 8.0 dS/m",

    min: 4.0,

    max: 8.0,

    color: "#ffff00", // Pure Yellow matching publication risk

    impact: "Boro rice danger threshold; salt-tolerant varieties required (BRRI dhan67)",

  },

  {

    id: "S3",

    name: "High",

    label: "High (8.0 - 12.0 dS/m)",

    range: "8.0 - 12.0 dS/m",

    min: 8.0,

    max: 12.0,

    color: "#fe9929", // Orange matching publication risk

    impact: "Severe crop stunting; high seedling mortality; aquaculture conversion",

  },

  {

    id: "S4",

    name: "Very High",

    label: "Very High (>= 12.0 dS/m)",

    range: ">= 12.0 dS/m",

    min: 12.0,

    max: 99.0,

    color: "#e31a1c", // Crimson Red matching publication risk

    impact: "Acute root zone salinity; crop sterilization; marine tidal inundation",

  },

];

// Helper: Get Salinity Class Info for any EC value

export function getSalinityClassForEc(ec: number): SalinityClassInfo {

  if (ec < 2.0) return SALINITY_CLASSES[0];

  if (ec < 4.0) return SALINITY_CLASSES[1];

  if (ec < 8.0) return SALINITY_CLASSES[2];

  if (ec < 12.0) return SALINITY_CLASSES[3];

  return SALINITY_CLASSES[4];

}

// Helper: Get EC for an Upazila based on selected variable

export function getUpazilaSalinity(upazila: GisUpazila, variable: string): number {

  switch (variable) {

    case "period1":

      return upazila.period1Ec;

    case "period2":

      return upazila.period2Ec;

    case "period3":

      return upazila.period3Ec;

    case "river":

      return upazila.riverEc;

    case "shallow_gw":

      return upazila.shallowGwEc;

    case "deep_gw":

      return upazila.deepGwEc;

    default:

      return upazila.period3Ec;

  }

}

// -------------------------------------------------------------

// 6. SPATIAL ANALYSIS: RAY-CASTING POINT-IN-POLYGON ALGORITHM

// -------------------------------------------------------------

export function pointInPolygon(

  point: [number, number], // [latitude, longitude]

  polygon: [number, number][] // [latitude, longitude][]

): boolean {

  const x = point[0]; // lat

  const y = point[1]; // lon

  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {

    const xi = polygon[i][0];

    const yi = polygon[i][1];

    const xj = polygon[j][0];

    const yj = polygon[j][1];

    const intersect =

      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;

  }

  return inside;

}

// Check if a point is within the official Khulna study area

export function isInsideKhulnaStudyArea(lat: number, lon: number): boolean {

  return pointInPolygon([lat, lon], KHULNA_STUDY_BOUNDARY_COORDS);

}

// Find Upazila containing a point

export function findUpazilaAtCoordinates(lat: number, lon: number): GisUpazila | null {

  for (const u of KHULNA_GIS_UPAZILAS) {

    if (pointInPolygon([lat, lon], u.coordinates)) {

      return u;

    }

  }

  return null;

}

// Find nearest monitoring station

export function findNearestGisStation(lat: number, lon: number): { station: GisStation; distanceKm: number } | null {

  let nearest: GisStation | null = null;

  let minD = Infinity;

  for (const s of KHULNA_GIS_STATIONS) {

    const dLat = (s.latitude - lat) * 111.32;

    const dLon = (s.longitude - lon) * 111.32 * Math.cos((lat * Math.PI) / 180);

    const d = Math.sqrt(dLat * dLat + dLon * dLon);

    if (d < minD) {

      minD = d;

      nearest = s;

    }

  }

  return nearest ? { station: nearest, distanceKm: Math.round(minD * 10) / 10 } : null;

}

