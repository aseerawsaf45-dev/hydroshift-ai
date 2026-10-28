export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  river?: string;
  category?: "swot" | "gauge" | "intake";
  baselineEc?: number;
  wsePwd?: number;
  distanceKm?: number;
  intakeHazard?: string;
}

export interface Forecast {
  id: string;
  site_id: string;
  target_time: string;
  target_variable: string;
  value: number;
  unit: string;
  validation_status: string;
}

export interface MapWrapperProps {
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site | null) => void;
  showSwot?: boolean;
  showGauges?: boolean;
  showSalinityFront?: boolean;
  showIsohalines?: boolean;
  basemap?: "dark" | "satellite" | "osm";
  horizon?: "now" | "7d" | "14d";
  searchQuery?: string;
  riskFilter?: "all" | "critical" | "warning" | "nominal";
  flyToCoords?: [number, number] | null;
  onSelectCorridor?: (corridorName: string) => void;
}

// -------------------------------------------------------------
// 1. CANONICAL HIGH-FIDELITY KHULNA STATIONS (OFFLINE & LIVE)
// -------------------------------------------------------------
export const CANONICAL_KHULNA_STATIONS: (Site & {
  category: "swot" | "gauge" | "intake";
  river: string;
  baselineEc: number;
  wsePwd: number;
  distanceKm: number;
  intakeHazard?: string;
})[] = [
  {
    id: "khulna-p14",
    name: "Khulna WASA Surface Water Intake (P-14 / Madhukhali)",
    latitude: 22.825,
    longitude: 89.575,
    river: "Rupsha",
    category: "intake",
    description: "Primary municipal raw water extraction facility for 1.5M Khulna City residents. Drinking water intake must be suspended when salinity breaches 1.5 dS/m.",
    baselineEc: 4.6,
    wsePwd: 1.76,
    distanceKm: 82.5,
    intakeHazard: "MUNICIPAL INTAKE AT RISK (>4.0 dS/m)",
  },
  {
    id: "SW241",
    name: "Khulna Rupsha Gauge (SW241)",
    latitude: 22.808,
    longitude: 89.580,
    river: "Rupsha",
    category: "gauge",
    description: "Official BWDB tidal station SW241 at Rupsha Bridge. Telemetry records 3-hourly river stage (PWD datum) and seasonal pre-monsoon salinity ingress.",
    baselineEc: 4.5,
    wsePwd: 1.84,
    distanceKm: 82.0,
  },
  {
    id: "31241400581",
    name: "NASA SWOT Reach: Upper Rupsha (Khulna Core)",
    latitude: 22.810,
    longitude: 89.595,
    river: "Rupsha",
    category: "swot",
    description: "NASA PO.DAAC Hydrocron High-Rate Reach #31241400581. KaRIn Ka-band radar interferometry measuring surface water elevation (WSE), width (420m), and slope (0.038 m/km).",
    baselineEc: 4.8,
    wsePwd: 1.85,
    distanceKm: 82.5,
  },
  {
    id: "SW244",
    name: "Mongla Seaport Station (SW244)",
    latitude: 22.464,
    longitude: 89.600,
    river: "Passur",
    category: "gauge",
    description: "Anchor marine-estuarine telemetry node SW244 on the Passur River. Direct conduit for Bay of Bengal semi-diurnal tidal surge and severe saltwater intrusion.",
    baselineEc: 7.9,
    wsePwd: 2.38,
    distanceKm: 35.0,
  },
  {
    id: "31241400601",
    name: "NASA SWOT Reach: Passur Main Channel (Mongla)",
    latitude: 22.470,
    longitude: 89.615,
    river: "Passur",
    category: "swot",
    description: "NASA PO.DAAC Hydrocron SWOT Reach #31241400601. High-rate Ka-band radar telemetry tracking Passur estuarine channel storage, width (880m), and tidal excursion.",
    baselineEc: 8.1,
    wsePwd: 2.42,
    distanceKm: 35.5,
  },
  {
    id: "batiaghata-polder",
    name: "Batiaghata Agricultural Polder 30",
    latitude: 22.710,
    longitude: 89.540,
    river: "Rupsha-Passur",
    category: "gauge",
    description: "Core Boro rice irrigation polder district. Sluice gates must close at high tide when river salinity exceeds the 4.0 dS/m crop sterilization threshold.",
    baselineEc: 3.9,
    wsePwd: 1.95,
    distanceKm: 72.0,
  },
  {
    id: "chalna-gauge",
    name: "Chalna Estuary / Dacope Port",
    latitude: 22.605,
    longitude: 89.570,
    river: "Passur",
    category: "gauge",
    description: "Mid-estuarine junction where Passur meets southern polder drainage networks. High vulnerability to cyclone surge ingress and dyke overtopping.",
    baselineEc: 5.2,
    wsePwd: 2.22,
    distanceKm: 58.0,
  },
  {
    id: "rampal-station",
    name: "Rampal Saline Transition Zone",
    latitude: 22.560,
    longitude: 89.640,
    river: "Passur-Mongla",
    category: "gauge",
    description: "Transitional brackish zone between Mongla and Khulna. Ground truth salinity sensors calibrated against Deltares and SRDI empirical soil-water baselines.",
    baselineEc: 5.8,
    wsePwd: 2.30,
    distanceKm: 52.0,
  },
  {
    id: "31241400561",
    name: "NASA SWOT Reach: Shibsa River Core",
    latitude: 22.550,
    longitude: 89.470,
    river: "Shibsa",
    category: "swot",
    description: "NASA PO.DAAC SWOT Reach #31241400561 traversing the western delta through Dacope. Captures wide mangrove channel cross-sections (1,120m) and tidal backwater.",
    baselineEc: 3.8,
    wsePwd: 2.15,
    distanceKm: 60.0,
  },
  {
    id: "paikgachha-station",
    name: "Paikgachha Western Delta Station",
    latitude: 22.585,
    longitude: 89.330,
    river: "Shibsa",
    category: "gauge",
    description: "Western Khulna agricultural and shrimp polder zone. Monitors hyper-saline intrusion from the Bay of Bengal through the Shibsa channel.",
    baselineEc: 4.2,
    wsePwd: 2.05,
    distanceKm: 62.0,
  },
  {
    id: "31241400541",
    name: "NASA SWOT Reach: Bay of Bengal Marine Ingress",
    latitude: 22.320,
    longitude: 89.620,
    river: "Passur Estuary",
    category: "swot",
    description: "Southernmost SWOT reach entering the Bay of Bengal at the northern Sundarbans fringe. High-rate open-water radar altimetry with 2,400m inundation width.",
    baselineEc: 12.4,
    wsePwd: 2.65,
    distanceKm: 15.0,
  },
  {
    id: "sundarbans-gate",
    name: "Sundarbans Ecological Reserve Boundary",
    latitude: 22.380,
    longitude: 89.590,
    river: "Passur",
    category: "gauge",
    description: "Northern edge of the UNESCO World Heritage Sundarbans mangrove forest. Ecological salinity benchmark tracking Sundari tree survival threshold.",
    baselineEc: 9.4,
    wsePwd: 2.50,
    distanceKm: 22.0,
  },
  {
    id: "SW162",
    name: "Jhikargacha (Kobadak River Gauge)",
    latitude: 23.102,
    longitude: 89.097,
    river: "Kobadak",
    category: "gauge",
    description: "BWDB automated stage station on the Kobadak river. Monitors upstream tributary stage and seasonal freshwater runoff.",
    baselineEc: 1.2,
    wsePwd: 4.10,
    distanceKm: 110.0,
  },
  {
    id: "gorai-rb",
    name: "Gorai Railway Bridge (Freshwater Source SW99)",
    latitude: 23.884,
    longitude: 89.183,
    river: "Gorai",
    category: "gauge",
    description: "Primary upstream freshwater lifeline for southwest Bangladesh. Discharge from the Ganges flushes salt out of the delta.",
    baselineEc: 0.4,
    wsePwd: 7.20,
    distanceKm: 165.0,
  },
];

// -------------------------------------------------------------
// 2. GEOGRAPHIC RIVER VECTORS & HYDRAULIC CORRIDORS
// -------------------------------------------------------------
export const PASSUR_MARINE_INGRESS_CORRIDOR: [number, number][] = [
  [22.250, 89.610], // Akram Point / Sundarbans Marine Fringe
  [22.320, 89.620], // Reach 31241400541
  [22.380, 89.605], // Sundarbans North Gate
  [22.464, 89.600], // Mongla Port (SW244)
  [22.520, 89.595], // Rampal South
];

export const PASSUR_TRANSITION_CORRIDOR: [number, number][] = [
  [22.520, 89.595], // Rampal South
  [22.560, 89.585], // Rampal Bridge
  [22.620, 89.578], // Chalna / Dacope Estuary
  [22.710, 89.570], // Batiaghata Polder
  [22.760, 89.575], // Khulna Bypass Reach
  [22.808, 89.580], // Rupsha Bridge (SW241)
  [22.825, 89.575], // Khulna WASA Intake (P-14)
];

export const RUPSHA_FRESHWATER_DILUTION: [number, number][] = [
  [22.825, 89.575], // Khulna WASA Intake (P-14)
  [22.870, 89.560], // Daulatpur
  [22.920, 89.530], // Phultala
  [22.990, 89.500], // Bhairab Confluence
];

export const SHIBSA_WESTERN_CORRIDOR: [number, number][] = [
  [22.280, 89.410], // Shibsa Marine Channel
  [22.380, 89.440], // Dacope Mangrove Outer Belt
  [22.480, 89.455], // Dacope South
  [22.550, 89.470], // Reach 31241400561
  [22.620, 89.435], // Paikgachha Polder 22
  [22.730, 89.390], // Kapilmuni Upper Reach
];

// -------------------------------------------------------------
// 3. NASA SWOT 120-KM WIDE-SWATH SATELLITE ORBIT POLYGONS
// -------------------------------------------------------------
export const SWOT_LEFT_SWATH: [number, number][] = [
  [23.10, 89.05],
  [22.95, 88.75],
  [22.15, 89.35],
  [22.30, 89.65],
];

export const SWOT_RIGHT_SWATH: [number, number][] = [
  [22.85, 89.78],
  [22.70, 89.48],
  [21.90, 90.08],
  [22.05, 90.38],
];

export const SWOT_NADIR_GROUND_TRACK: [number, number][] = [
  [23.00, 89.40],
  [22.50, 89.75],
  [22.00, 90.10],
];

// -------------------------------------------------------------
// 4. PREMIUM BASEMAP DEFINITIONS (4K RETINA GIS TILES - ZERO WATERMARK)
// -------------------------------------------------------------
export const BASEMAP_TILES = {
  dark: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    name: "Dark Radar",
  },
  satellite: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; NASA, USGS, ESA, GeoEye",
    name: "KaRIn Satellite",
  },
  osm: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ref: null,
    attribution: "Tiles &copy; Esri &mdash; USGS, NOAA",
    name: "Hydro Topo",
  },
};
