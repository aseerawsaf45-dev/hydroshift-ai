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

export type RiskTier = "Very Low" | "Low" | "Moderate" | "High" | "Very High";

export type HydrologicDomain = "river" | "shallow_gw" | "deep_gw";

export interface SalinityTier {
  min: number;
  max: number;
  label: string; // e.g. "0.10 to 0.11"
  color: string; // Hex color matching reference paper
  fillColor: string;
  textColor?: string;
}

export interface DomainConfig {
  id: HydrologicDomain;
  panelId: "(a)" | "(b)" | "(c)";
  title: string;
  shortTitle: string;
  unit: string;
  description: string;
  waterSource: string;
  targetDepth: string;
  implication: string;
  tiers: SalinityTier[];
}

export const DOMAIN_CONFIGS: Record<HydrologicDomain, DomainConfig> = {
  river: {
    id: "river",
    panelId: "(a)",
    title: "Salinity in River Water",
    shortTitle: "River Surface Water",
    unit: "ppt",
    description: "NASA SWOT Estuarine Hydrodynamics & Marine Tidal Surge",
    waterSource: "Surface Rivers (Passur, Shibsa, Rupsha)",
    targetDepth: "Surface water column (0 - 8m)",
    implication: "Directly governs irrigation canal intake opening and municipal water extraction at Madhukhali Intake (P-14).",
    tiers: [
      { min: 0.10, max: 0.11, label: "0.10 to 0.11", color: "#1b75bb", fillColor: "#1b75bb", textColor: "#ffffff" },
      { min: 0.11, max: 0.16, label: "0.11 to 0.16", color: "#7eb8a8", fillColor: "#7eb8a8", textColor: "#0f172a" },
      { min: 0.16, max: 0.38, label: "0.16 to 0.38", color: "#fbf089", fillColor: "#fbf089", textColor: "#451a03" },
      { min: 0.38, max: 1.20, label: "0.38 to 1.20", color: "#f5a623", fillColor: "#f5a623", textColor: "#ffffff" },
      { min: 1.20, max: 4.45, label: "1.20 to 4.45", color: "#e65124", fillColor: "#e65124", textColor: "#ffffff" },
      { min: 4.45, max: 17.20, label: "4.45 to 17.20", color: "#d92526", fillColor: "#d92526", textColor: "#ffffff" },
    ],
  },
  shallow_gw: {
    id: "shallow_gw",
    panelId: "(b)",
    title: "Salinity in Shallow Groundwater",
    shortTitle: "Shallow Groundwater",
    unit: "ppt",
    description: "Upper Holocene Aquifer & Boro Rice Root Zone Capillary Rise",
    waterSource: "Shallow Unconfined Aquifer",
    targetDepth: "10 - 50 meters below ground level",
    implication: "Saline shrimp gher seepage and dry season evaporation pull salts to root zones, causing acute Boro rice seedling toxicity.",
    tiers: [
      { min: 0.1, max: 0.5, label: "0.1 to 0.5", color: "#1b75bb", fillColor: "#1b75bb", textColor: "#ffffff" },
      { min: 0.5, max: 1.0, label: "0.5 to 1", color: "#7eb8a8", fillColor: "#7eb8a8", textColor: "#0f172a" },
      { min: 1.0, max: 2.0, label: "1 to 2", color: "#fbf089", fillColor: "#fbf089", textColor: "#451a03" },
      { min: 2.0, max: 5.0, label: "2 to 5", color: "#f5a623", fillColor: "#f5a623", textColor: "#ffffff" },
      { min: 5.0, max: 10.0, label: "5 to 10", color: "#e65124", fillColor: "#e65124", textColor: "#ffffff" },
      { min: 10.0, max: 16.0, label: "10 to 16", color: "#d92526", fillColor: "#d92526", textColor: "#ffffff" },
    ],
  },
  deep_gw: {
    id: "deep_gw",
    panelId: "(c)",
    title: "Salinity in Deep Groundwater",
    shortTitle: "Deep Aquifer",
    unit: "ppt",
    description: "Confined Pleistocene Aquifer & Municipal Drinking Wellfields",
    waterSource: "Confined Pleistocene Aquifer",
    targetDepth: "150 - 300 meters PWD",
    implication: "Protected from surface saltwater by thick impermeable clay aquitards. Primary source of potable drinking water for Khulna WASA.",
    tiers: [
      { min: 0.4, max: 2.0, label: "0.4 to 2", color: "#1b75bb", fillColor: "#1b75bb", textColor: "#ffffff" },
      { min: 2.0, max: 2.6, label: "2 to 2.6", color: "#7eb8a8", fillColor: "#7eb8a8", textColor: "#0f172a" },
      { min: 2.6, max: 3.0, label: "2.6 to 3", color: "#fbf089", fillColor: "#fbf089", textColor: "#451a03" },
      { min: 3.0, max: 4.0, label: "3 to 4", color: "#f5a623", fillColor: "#f5a623", textColor: "#ffffff" },
      { min: 4.0, max: 5.0, label: "4 to 5", color: "#e65124", fillColor: "#e65124", textColor: "#ffffff" },
      { min: 5.0, max: 10.0, label: "5 to 10", color: "#d92526", fillColor: "#d92526", textColor: "#ffffff" },
    ],
  },
};

export interface KhulnaRegion {
  id: string;
  name: string;
  bengaliName: string;
  riskTier: RiskTier;
  color: string;
  fillColor: string;
  avgEc: number; // in dS/m
  soilEc: number; // in dS/m
  areaKm2: number;
  population: number;
  polders: string[];
  intakeRisk: string;
  boroVulnerability: string;
  sluiceAdvisory: string;
  recommendedCrops: string[];
  associatedStationIds: string[];
  bounds: [[number, number], [number, number]]; // [SW, NE]
  center: [number, number];
  coordinates: [number, number][];

  // 3-Domain Scientific Salinity Data (ppt)
  riverSalinityPpt: number;
  shallowGwSalinityPpt: number;
  deepGwSalinityPpt: number;
  aquiferDepthM: string;
  drinkingSafety: string;
  hydrogeologySummary: string;
}

export interface MapWrapperProps {
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site | null) => void;
  selectedRegionId?: string | null;
  onSelectRegion?: (region: KhulnaRegion | null) => void;
  hydrologicDomain?: HydrologicDomain;
  onSelectDomain?: (domain: HydrologicDomain) => void;
  showRiskChoropleth?: boolean;
  showSwot?: boolean;
  showGauges?: boolean;
  showSalinityFront?: boolean;
  showIsohalines?: boolean;
  showPolders?: boolean;
  showThalweg?: boolean;
  showLabels?: boolean;
  showRivers?: boolean;
  showGraticule?: boolean;
  basemap?: "offline" | "academic" | "satellite" | "dark" | "topo" | "osm";
  horizon?: "now" | "7d" | "14d";
  searchQuery?: string;
  riskFilter?: "all" | "critical" | "warning" | "nominal";
  flyToCoords?: [number, number] | null;
  onSelectCorridor?: (corridorName: string) => void;
  onSelectPolder?: (polder: PolderPolygon | null) => void;
  salinityUnit?: "ppt" | "dS/m";
  onToggleUnit?: () => void;
  compactLegend?: boolean;
  standaloneTitle?: string;
  rasterOpacity?: number;
  onOpacityChange?: (val: number) => void;
  showRasterOverlay?: boolean;
  onToggleRasterOverlay?: () => void;
  studyArea?: "delta_publication" | "khulna_basin" | "all";
  onSelectStudyArea?: (area: "delta_publication" | "khulna_basin" | "all") => void;
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
// 1b. CANONICAL HARDCODED PINN FORECASTS (100% OFFLINE / ZERO API)
// -------------------------------------------------------------
export const CANONICAL_KHULNA_FORECASTS: Forecast[] = [
  { id: "fc-p14", site_id: "khulna-p14", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 4.6, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-sw241", site_id: "SW241", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 4.5, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-31241400581", site_id: "31241400581", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 4.8, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-sw244", site_id: "SW244", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 7.9, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-31241400601", site_id: "31241400601", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 8.1, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-batiaghata", site_id: "batiaghata-polder", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 3.9, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-chalna", site_id: "chalna-gauge", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 5.2, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-rampal", site_id: "rampal-station", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 5.8, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-31241400561", site_id: "31241400561", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 3.8, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-paikgachha", site_id: "paikgachha-station", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 4.2, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-31241400541", site_id: "31241400541", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 12.4, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-sundarbans", site_id: "sundarbans-gate", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 9.4, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-sw162", site_id: "SW162", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 1.2, unit: "dS/m", validation_status: "VALIDATED" },
  { id: "fc-gorai", site_id: "gorai-rb", target_time: "2026-11-05T00:00:00Z", target_variable: "Salinity (EC)", value: 0.4, unit: "dS/m", validation_status: "VALIDATED" },
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
// 4. PROFESSIONAL GIS BASEMAP DEFINITIONS (WITH 100% OFFLINE LOCAL VECTOR ENGINE)
// -------------------------------------------------------------
export const KHULNA_REGIONAL_LANDMASS: [number, number][] = [
  [23.25, 88.90],
  [23.25, 89.95],
  [22.45, 89.95],
  [21.65, 89.85],
  [21.65, 89.15],
  [22.15, 88.95],
  [22.75, 88.90],
  [23.25, 88.90],
];

export const BASEMAP_TILES = {
  offline: {
    base: "",
    ref: null,
    subdomains: "",
    attribution: "100% Offline Local Vector GIS &bull; Zero External API Latency",
    name: "Instant Offline GIS",
    description: "Instant loading local vector cartography with zero API requests or tile loading delay",
  },
  academic: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    attribution: "Tiles &copy; Esri &mdash; Academic GIS Base",
    name: "Scientific Academic",
    description: "Clean publication white paper GIS cartography matching academic journals",
  },
  satellite: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    attribution: "Tiles &copy; Esri &mdash; NASA Earth Data, USGS, ESA, Maxar",
    name: "Satellite Hybrid",
    description: "High-resolution orbital satellite photography with place labels",
  },
  dark: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    ref: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    name: "Dark Radar",
    description: "High-contrast dark radar basemap with crisp reference typography",
  },
  topo: {
    base: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ref: null,
    subdomains: "",
    attribution: "Tiles &copy; Esri &mdash; USGS, NOAA, DeLorme",
    name: "Hydro Topo",
    description: "Topographic elevation contours with river hydrography",
  },
  osm: {
    base: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ref: null,
    subdomains: "abc",
    attribution: "&copy; OpenStreetMap contributors",
    name: "Street / Cadastral",
    description: "Detailed civil infrastructure, roads, and village polder networks",
  },
};

// -------------------------------------------------------------
// 5. COASTAL POLDER BOUNDARIES & PROTECTED EMBANKMENTS (GIS POLYGONS)
// -------------------------------------------------------------
export interface PolderPolygon {
  id: string;
  name: string;
  upazila: string;
  areaKm2: number;
  embankmentKm: number;
  elevationM: number;
  status: "Protected" | "At Risk" | "Critical";
  salinityRisk: string;
  color: string;
  coordinates: [number, number][];
}

export const COASTAL_POLDERS: PolderPolygon[] = [
  {
    id: "polder-31",
    name: "Polder 31 (Dacope)",
    upazila: "Dacope",
    areaKm2: 84.5,
    embankmentKm: 42.0,
    elevationM: 1.4,
    status: "At Risk",
    salinityRisk: "Severe Boro Rice hazard during pre-monsoon dry season (>4.0 dS/m)",
    color: "#f59e0b",
    coordinates: [
      [22.680, 89.490],
      [22.685, 89.540],
      [22.645, 89.560],
      [22.585, 89.540],
      [22.580, 89.485],
      [22.630, 89.475],
      [22.680, 89.490],
    ],
  },
  {
    id: "polder-32",
    name: "Polder 32 (Sutarkhali / Dacope)",
    upazila: "Dacope",
    areaKm2: 67.2,
    embankmentKm: 48.5,
    elevationM: 1.2,
    status: "Critical",
    salinityRisk: "Hyper-saline tidal exposure (>7.0 dS/m); vulnerable to embankment overtopping",
    color: "#f43f5e",
    coordinates: [
      [22.570, 89.480],
      [22.575, 89.535],
      [22.510, 89.545],
      [22.450, 89.525],
      [22.445, 89.470],
      [22.510, 89.455],
      [22.570, 89.480],
    ],
  },
  {
    id: "polder-30",
    name: "Polder 30 (Batiaghata)",
    upazila: "Batiaghata",
    areaKm2: 95.0,
    embankmentKm: 38.0,
    elevationM: 1.8,
    status: "Protected",
    salinityRisk: "Moderate salinity ingress; freshwater canal buffers buffer early Boro",
    color: "#10b981",
    coordinates: [
      [22.780, 89.500],
      [22.790, 89.565],
      [22.730, 89.575],
      [22.690, 89.545],
      [22.700, 89.495],
      [22.780, 89.500],
    ],
  },
  {
    id: "sundarbans-boundary",
    name: "Sundarbans Biosphere Mangrove Zone",
    upazila: "Protected Forest Reserve",
    areaKm2: 6017.0,
    embankmentKm: 0.0,
    elevationM: 0.8,
    status: "Protected",
    salinityRisk: "Natural mangrove tidal buffer; saline intrusion tolerance limit 15 dS/m",
    color: "#059669",
    coordinates: [
      [22.450, 89.200],
      [22.450, 89.700],
      [22.380, 89.650],
      [22.250, 89.630],
      [22.200, 89.400],
      [22.300, 89.200],
      [22.450, 89.200],
    ],
  },
];

// -------------------------------------------------------------
// 6. PASSUR-RUPSHA CURVILINEAR THALWEG CENTERLINE & CHAINAGE
// -------------------------------------------------------------
export const PASSUR_RUPSHA_THALWEG: [number, number][] = [
  [21.7500, 89.5800], // 0.00 km: Bay of Bengal Mouth
  [21.8500, 89.5950], // 11.2 km: Hiron Point Outer Approach
  [21.9800, 89.6100], // 25.8 km: Akram Point
  [22.1200, 89.6250], // 41.5 km: Southern Sundarbans Fringe
  [22.2500, 89.6150], // 56.1 km: Reach 31241000011
  [22.3800, 89.6050], // 70.6 km: Sundarbans Northern Forest Gate
  [22.4642, 89.6000], // 80.1 km / Mongla Node (SW244)
  [22.5200, 89.5950], // Rampal Reach
  [22.5600, 89.5850], // Rampal Bridge
  [22.6050, 89.5700], // Chalna / Dacope Estuary Gauge (SW242)
  [22.7100, 89.5400], // Batiaghata Polder 30 Flap Gate
  [22.7600, 89.5650], // Alutala Sluice Junction
  [22.8082, 89.5805], // Khulna Rupsha Bridge (SW241)
  [22.8250, 89.5750], // Khulna WASA Madhukhali Intake (p14)
];

export const THALWEG_MILESTONES = [
  { km: 0, label: "0 km (Sea Mouth)", coords: [21.750, 89.580] as [number, number] },
  { km: 26, label: "26 km (Akram Pt)", coords: [21.980, 89.610] as [number, number] },
  { km: 54, label: "54 km (Mongla)", coords: [22.464, 89.600] as [number, number] },
  { km: 65, label: "65 km (Chalna)", coords: [22.605, 89.570] as [number, number] },
  { km: 82, label: "82 km (Khulna WASA)", coords: [22.825, 89.575] as [number, number] },
];

export const POLDER_SLUICE_GATES = [
  { id: "gate-alutala", name: "Alutala 10-Vent Sluice Gate", coords: [22.760, 89.565] as [number, number], polder: "Polder 30", status: "Active Drainage" },
  { id: "gate-sutarkhali", name: "Sutarkhali Flap Gate Sluice", coords: [22.490, 89.540] as [number, number], polder: "Polder 32", status: "Locked Shut (Tide High)" },
  { id: "gate-chalna", name: "Chalna Estuarine Regulating Sluice", coords: [22.610, 89.575] as [number, number], polder: "Polder 31", status: "Active Drainage" },
];

// -------------------------------------------------------------
// 7. KHULNA DISTRICT CANONICAL BOUNDS & 5-TIER RISK CONFIG
// -------------------------------------------------------------
export const KHULNA_DISTRICT_BOUNDS: [[number, number], [number, number]] = [
  [22.18, 89.20], // Southwest bound (Koyra / Sundarbans border)
  [23.08, 89.70], // Northeast bound (Terokhada / Phultala border)
];

export const KHULNA_DISTRICT_CENTER: [number, number] = [22.68, 89.48];

// Canonical bounds for the Peer-Reviewed Coastal Delta Study Graphic (media_1793251878374.png)
export const PUBLICATION_STUDY_BOUNDS: [[number, number], [number, number]] = [
  [21.40, 89.90], // Southwest maritime bound (Bay of Bengal / Kuakata outer shelf)
  [23.55, 90.95], // Northeast alluvial bound (Munshiganj / Meghna confluence)
];

export const PUBLICATION_STUDY_CENTER: [number, number] = [22.45, 90.45];

export const RISK_TIERS_CONFIG: {
  tier: RiskTier;
  color: string;
  fillColor: string;
  label: string;
  range: string;
  badgeClass: string;
}[] = [
  {
    tier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    label: "Very Low",
    range: "< 1.0 dS/m",
    badgeClass: "bg-emerald-950/80 text-emerald-300 border-emerald-600/50",
  },
  {
    tier: "Low",
    color: "#65a30d",
    fillColor: "#65a30d",
    label: "Low",
    range: "1.0 - 2.5 dS/m",
    badgeClass: "bg-lime-950/80 text-lime-300 border-lime-600/50",
  },
  {
    tier: "Moderate",
    color: "#eab308",
    fillColor: "#eab308",
    label: "Moderate",
    range: "2.5 - 5.0 dS/m",
    badgeClass: "bg-amber-950/80 text-amber-300 border-amber-500/50",
  },
  {
    tier: "High",
    color: "#ea580c",
    fillColor: "#ea580c",
    label: "High",
    range: "5.0 - 8.0 dS/m",
    badgeClass: "bg-orange-950/80 text-orange-300 border-orange-500/50",
  },
  {
    tier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    label: "Very High",
    range: "> 8.0 dS/m",
    badgeClass: "bg-rose-950/80 text-rose-300 border-rose-500/50",
  },
];

// -------------------------------------------------------------
// 8. KHULNA DISTRICT UPAZILA RISK CHOROPLETH REGIONS
// -------------------------------------------------------------
export const KHULNA_UPAZILA_REGIONS: KhulnaRegion[] = [
  {
    id: "koyra",
    name: "Koyra Upazila",
    bengaliName: "কয়রা উপজেলা",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 12.4,
    soilEc: 10.8,
    areaKm2: 1775.4,
    population: 202000,
    polders: ["Polder 13/1", "Polder 14/1", "Koyra Coastal Embankment"],
    intakeRisk: "Critical marine surge penetration. Surface river EC exceeds 12 dS/m throughout dry season (Feb-May).",
    boroVulnerability: "Acute sterilization hazard. Surface water completely unfit for Boro rice (>10 dS/m). High seedling mortality.",
    sluiceAdvisory: "Completely lock all gravity intake sluices during high tide. Only discharge interior rainwater runoff during minimum low water springs.",
    recommendedCrops: [
      "BRRI dhan67 (Max 8 dS/m)",
      "BINA dhan-10 (Salt tolerant)",
      "Brackish Shrimp (Bagda) / Crab Fattening",
      "Sunflower (Hysun-33)",
    ],
    associatedStationIds: ["31241000011", "SW244"],
    bounds: [
      [22.180, 89.240],
      [22.480, 89.460],
    ],
    center: [22.340, 89.340],
    coordinates: [
      [22.480, 89.300],
      [22.470, 89.370],
      [22.420, 89.440],
      [22.350, 89.460],
      [22.280, 89.420],
      [22.220, 89.380],
      [22.180, 89.330],
      [22.190, 89.280],
      [22.250, 89.260],
      [22.330, 89.240],
      [22.410, 89.270],
      [22.480, 89.300],
    ],
    riverSalinityPpt: 14.8,
    shallowGwSalinityPpt: 12.2,
    deepGwSalinityPpt: 5.8,
    aquiferDepthM: "Shallow: 15-35m | Deep: 220-280m",
    drinkingSafety: "CRITICAL: Surface & shallow GW completely brackish (>12 ppt). Deep wellfields yield marginal brackish water (5.8 ppt). Managed Aquifer Recharge (MAR) required.",
    hydrogeologySummary: "Coastal fringe estuary adjacent to Sundarbans. Semi-pervious upper aquitard subjected to daily marine tidal pulsing.",
  },
  {
    id: "dacope",
    name: "Dacope Upazila",
    bengaliName: "দাকোপ উপজেলা",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 8.8,
    soilEc: 7.6,
    areaKm2: 991.6,
    population: 157000,
    polders: ["Polder 31 (Bajua / Pankhali)", "Polder 32 (Kamarkhola / Sutarkhali)", "Polder 33"],
    intakeRisk: "Severe estuarine tidal intrusion along Passur and Shibsa channels. SW244 Mongla records 7.9 - 9.2 dS/m.",
    boroVulnerability: "Severe danger during Boro panicle initiation (March-April). River water irrigation causes acute leaf tip scorch.",
    sluiceAdvisory: "Open Sutarkhali & Bajua flap gates only during 2-hour window after slack high water when SWOT river stage drops below polder canal stage.",
    recommendedCrops: [
      "BRRI dhan67",
      "BRRI dhan97",
      "Sesame (BINA Til-2 / Til-3)",
      "Sunflower (Hysun-33)",
      "Aman Relaying (BRRI dhan52)",
    ],
    associatedStationIds: ["SW244", "31241400601", "chalna-gauge", "31241400561", "gate-sutarkhali", "gate-chalna"],
    bounds: [
      [22.420, 89.450],
      [22.680, 89.660],
    ],
    center: [22.560, 89.550],
    coordinates: [
      [22.680, 89.520],
      [22.670, 89.580],
      [22.620, 89.640],
      [22.550, 89.660],
      [22.480, 89.610],
      [22.420, 89.550],
      [22.430, 89.490],
      [22.490, 89.460],
      [22.580, 89.480],
      [22.680, 89.520],
    ],
    riverSalinityPpt: 8.4,
    shallowGwSalinityPpt: 8.1,
    deepGwSalinityPpt: 3.4,
    aquiferDepthM: "Shallow: 20-45m | Deep: 240-300m",
    drinkingSafety: "SEVERE HAZARD: Shallow GW exceeds 8 ppt due to shrimp gher infiltration. Deep Pleistocene aquifer potable at 3.4 ppt but requires desalination blending.",
    hydrogeologySummary: "Passur-Shibsa inter-estuarine plain. Thick upper silt-clay cap (14m) overlies Holocene fine sand; confined Pleistocene deep aquifer at 250m PWD.",
  },
  {
    id: "paikgachha",
    name: "Paikgachha Upazila",
    bengaliName: "পাইকগাছা উপজেলা",
    riskTier: "High",
    color: "#ea580c",
    fillColor: "#ea580c",
    avgEc: 6.9,
    soilEc: 6.2,
    areaKm2: 411.2,
    population: 248000,
    polders: ["Polder 22 (Gadaipur)", "Polder 23", "Polder 20"],
    intakeRisk: "High brackish intrusion through western Shibsa and Kobodak estuaries. Saline shrimp aquaculture seepage.",
    boroVulnerability: "High vulnerability; canal storage must be topped off in December before river salinity exceeds 4.0 dS/m.",
    sluiceAdvisory: "Seal dyke breaches against uncontrolled shrimp gher saltwater pumping adjacent to crop clusters; monitor canal EC weekly.",
    recommendedCrops: [
      "BRRI dhan67",
      "BRRI dhan89 (Early Harvest)",
      "Mustard (BARI Sarisha-14 / 17)",
      "Watermelon",
      "Maize (Pac 339)",
    ],
    associatedStationIds: ["paikgachha-shibsa", "31241400561"],
    bounds: [
      [22.460, 89.220],
      [22.720, 89.450],
    ],
    center: [22.580, 89.330],
    coordinates: [
      [22.720, 89.320],
      [22.710, 89.410],
      [22.660, 89.440],
      [22.580, 89.450],
      [22.480, 89.370],
      [22.460, 89.280],
      [22.510, 89.230],
      [22.620, 89.220],
      [22.720, 89.320],
    ],
    riverSalinityPpt: 6.2,
    shallowGwSalinityPpt: 7.4,
    deepGwSalinityPpt: 2.8,
    aquiferDepthM: "Shallow: 18-40m | Deep: 210-270m",
    drinkingSafety: "HIGH RISK: Upper aquifer contaminated by extensive brackish shrimp ponds. Deep aquifer potable (<3.0 ppt) with BWDB monitored wellfields.",
    hydrogeologySummary: "Western Kobodak basin. Downward vertical seepage head from brackish surface waters into semi-confined upper sand aquifer.",
  },
  {
    id: "batiaghata",
    name: "Batiaghata Upazila",
    bengaliName: "বটিয়াঘাটা উপজেলা",
    riskTier: "Moderate",
    color: "#eab308",
    fillColor: "#eab308",
    avgEc: 4.1,
    soilEc: 3.8,
    areaKm2: 248.3,
    population: 172000,
    polders: ["Polder 30 (Batiaghata)", "Polder 29"],
    intakeRisk: "Critical threshold zone; river salinity oscillates across 4.0 dS/m during March-April spring tides.",
    boroVulnerability: "Moderate to high; dynamic SWOT timing enables safe irrigation during ebb tide when salinity temporarily falls below 3.5 dS/m.",
    sluiceAdvisory: "Close Alutala 10-Vent Sluice when Rupsha EC reaches 3.8 dS/m; irrigate exclusively from internal freshwater reserve khals.",
    recommendedCrops: [
      "BRRI dhan28 / 29 (with freshwater canal buffering)",
      "BRRI dhan67",
      "BINA dhan-8",
      "Wheat (BARI Gom-25)",
      "Lentils / Grasspea",
    ],
    associatedStationIds: ["batiaghata-polder", "gate-alutala", "SW241"],
    bounds: [
      [22.660, 89.440],
      [22.820, 89.620],
    ],
    center: [22.740, 89.530],
    coordinates: [
      [22.820, 89.520],
      [22.810, 89.590],
      [22.740, 89.620],
      [22.680, 89.580],
      [22.660, 89.510],
      [22.700, 89.450],
      [22.780, 89.460],
      [22.820, 89.520],
    ],
    riverSalinityPpt: 2.8,
    shallowGwSalinityPpt: 3.5,
    deepGwSalinityPpt: 1.8,
    aquiferDepthM: "Shallow: 25-50m | Deep: 200-260m",
    drinkingSafety: "MODERATE RISK: Shallow aquifer suitable for salt-tolerant Boro rice (3.5 ppt). Deep aquifer excellent drinking quality (<2.0 ppt).",
    hydrogeologySummary: "Deltaic transition zone. Tidal salinity front advances past Alutala Sluice during March spring tides; freshwater recharge buffers north section.",
  },
  {
    id: "dumuria",
    name: "Dumuria Upazila",
    bengaliName: "ডুমুরিয়া উপজেলা",
    riskTier: "Low",
    color: "#65a30d",
    fillColor: "#65a30d",
    avgEc: 2.2,
    soilEc: 1.8,
    areaKm2: 454.2,
    population: 306000,
    polders: ["Polder 28/1", "Polder 29", "Upper Ghashiakhali Canal"],
    intakeRisk: "Low salinity risk; protected by upstream Gorai-Madhumati freshwater dilution and controlled regulators.",
    boroVulnerability: "Low risk under normal tidal conditions; slight backwater ingress during extreme dry season neap tides.",
    sluiceAdvisory: "Maintain active gravity flushing; store early February freshwater in internal khals for April peak grain filling.",
    recommendedCrops: [
      "BRRI dhan28",
      "BRRI dhan29",
      "Boro Hybrid (SL-8H)",
      "Vegetables (Tomato, Brinjal, Cabbage)",
      "Potato",
    ],
    associatedStationIds: ["batiaghata-polder"],
    bounds: [
      [22.720, 89.260],
      [22.950, 89.520],
    ],
    center: [22.830, 89.400],
    coordinates: [
      [22.950, 89.360],
      [22.940, 89.460],
      [22.870, 89.510],
      [22.780, 89.490],
      [22.730, 89.420],
      [22.740, 89.320],
      [22.820, 89.270],
      [22.910, 89.290],
      [22.950, 89.360],
    ],
    riverSalinityPpt: 0.85,
    shallowGwSalinityPpt: 1.6,
    deepGwSalinityPpt: 1.1,
    aquiferDepthM: "Shallow: 20-55m | Deep: 180-240m",
    drinkingSafety: "SAFE / NOMINAL: Shallow GW safe for general agriculture (1.6 ppt). Deep aquifer provides pristine drinking water (1.1 ppt).",
    hydrogeologySummary: "Gorai-Madhumati freshwater flood basin. Strong upward hydraulic gradient prevents significant saltwater penetration.",
  },
  {
    id: "khulna-sadar",
    name: "Khulna Sadar & Rupsha",
    bengaliName: "খুলনা সদর ও রূপসা",
    riskTier: "Low",
    color: "#65a30d",
    fillColor: "#65a30d",
    avgEc: 2.8,
    soilEc: 1.4,
    areaKm2: 130.5,
    population: 820000,
    polders: ["Khulna Urban Polder", "East Rupsha Embankment"],
    intakeRisk: "WASA drinking water intake at Madhukhali vulnerable when Rupsha salinity breaches 1.0 dS/m municipal standard.",
    boroVulnerability: "Low agricultural footprint; high municipal drinking and industrial cooling water vulnerability.",
    sluiceAdvisory: "Coordinate with Khulna WASA; activate Bangabandhu Bridge deep tube well emergency backup when river EC > 1.5 dS/m.",
    recommendedCrops: [
      "Peri-urban Horticulture",
      "Spices (Chili, Turmeric)",
      "BRRI dhan29",
      "Guava / Betel Leaf",
    ],
    associatedStationIds: ["khulna-p14", "SW241", "31241400581"],
    bounds: [
      [22.780, 89.500],
      [22.930, 89.650],
    ],
    center: [22.840, 89.570],
    coordinates: [
      [22.930, 89.540],
      [22.920, 89.630],
      [22.850, 89.650],
      [22.780, 89.620],
      [22.790, 89.540],
      [22.850, 89.510],
      [22.930, 89.540],
    ],
    riverSalinityPpt: 1.45,
    shallowGwSalinityPpt: 1.2,
    deepGwSalinityPpt: 0.8,
    aquiferDepthM: "Shallow: 30-60m | Deep: 200-280m",
    drinkingSafety: "POTABLE: Khulna WASA deep production tube-wells extract fresh Pleistocene water (0.8 ppt). Madhukhali surface intake monitored against 1.0 ppt threshold.",
    hydrogeologySummary: "Major urban extraction center. Deep confined sand aquifer protected by regional 35m impervious clay aquitard.",
  },
  {
    id: "phultala",
    name: "Phultala, Dighalia & Terokhada",
    bengaliName: "ফুলতলা, দিঘলিয়া ও তেরখাদা",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.6,
    soilEc: 0.4,
    areaKm2: 412.0,
    population: 310000,
    polders: ["Bhairab North Canal", "Atai-Bhairab Polder"],
    intakeRisk: "Zero marine salinity risk; perennial freshwater corridor supplied by Gorai distributaries.",
    boroVulnerability: "Negligible salinity risk; prime freshwater agricultural heartland and seed nursery zone.",
    sluiceAdvisory: "Keep all sluices open for uninterrupted irrigation; maximum pumping permitted.",
    recommendedCrops: [
      "High-yield Boro (BRRI dhan29 / 89 / 92)",
      "Sugarcane",
      "Jute (Toshe / Deshi)",
      "Winter Vegetables",
      "Banana",
    ],
    associatedStationIds: ["31241400581", "khulna-p14"],
    bounds: [
      [22.900, 89.400],
      [23.080, 89.700],
    ],
    center: [22.990, 89.550],
    coordinates: [
      [23.080, 89.480],
      [23.070, 89.620],
      [23.010, 89.700],
      [22.920, 89.670],
      [22.910, 89.530],
      [22.940, 89.430],
      [23.020, 89.410],
      [23.080, 89.480],
    ],
    riverSalinityPpt: 0.14,
    shallowGwSalinityPpt: 0.35,
    deepGwSalinityPpt: 0.45,
    aquiferDepthM: "Shallow: 15-50m | Deep: 150-220m",
    drinkingSafety: "PRISTINE: Both shallow and deep groundwater completely fresh (<0.5 ppt). Ideal for intensive year-round irrigation and direct consumption.",
    hydrogeologySummary: "Upper deltaic alluvial plain. Direct fluvial recharge from Bhairab and Gorai distributaries maintains fresh hydraulic barrier.",
  },
];

// -------------------------------------------------------------
// 8b. COASTAL DELTA UPAZILAS (EXACT 15 UPAZILAS FROM PUBLICATION FIG 1)
// Munshiganj, Shariatpur, Chandpur, Haimchar, Raipur, Lakshmipur,
// Wazirpur, Barishal, Bhola, Charfasson, Mirzaganj, Patuakhali, Barguna, Amtali, Kalapara
// -------------------------------------------------------------
export const COASTAL_DELTA_UPAZILAS: KhulnaRegion[] = [
  {
    id: "munshiganj",
    name: "Munshiganj",
    bengaliName: "মুন্সীগঞ্জ",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.16,
    soilEc: 0.2,
    areaKm2: 240.5,
    population: 380000,
    polders: ["Dhaleshwari Polder", "Padma Floodplain Embankment"],
    intakeRisk: "Pristine freshwater river reach south of Dhaka. Salinity consistently <0.15 ppt.",
    boroVulnerability: "Negligible. High-yield Boro rice zone irrigated safely from surface water.",
    sluiceAdvisory: "Unrestricted gravity sluice intake year-round.",
    recommendedCrops: ["BRRI dhan29", "Potato (Diamant)", "Mustard", "Vegetables"],
    associatedStationIds: ["munshiganj-sw"],
    bounds: [[23.38, 90.40], [23.55, 90.62]],
    center: [23.48, 90.50],
    coordinates: [
      [23.55, 90.42], [23.55, 90.60], [23.40, 90.62], [23.38, 90.45], [23.44, 90.38], [23.55, 90.42]
    ],
    riverSalinityPpt: 0.10,
    shallowGwSalinityPpt: 0.20,
    deepGwSalinityPpt: 0.85,
    aquiferDepthM: "Shallow: 15-45m | Deep: 140-200m",
    drinkingSafety: "SAFE / POTABLE: Both surface river and groundwater pristine (<0.3 ppt).",
    hydrogeologySummary: "Upper deltaic Ganges-Meghna confluence with continuous upstream freshwater flush."
  },
  {
    id: "shariatpur",
    name: "Shariatpur",
    bengaliName: "শরীয়তপুর",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.17,
    soilEc: 0.3,
    areaKm2: 1180.0,
    population: 1150000,
    polders: ["Kirtinasha Polder", "Palong Embankment"],
    intakeRisk: "Directly flushed by Padma river mainstem. Low salinity (<0.12 ppt).",
    boroVulnerability: "Minimal salinity risk; seasonal river erosion rather than salinity is the primary water challenge.",
    sluiceAdvisory: "Open drainage and intake channels for Boro cultivation.",
    recommendedCrops: ["BRRI dhan28 / 29", "Jute", "Lentils", "Wheat"],
    associatedStationIds: ["shariatpur-sw"],
    bounds: [[23.10, 90.20], [23.40, 90.60]],
    center: [23.24, 90.35],
    coordinates: [
      [23.38, 90.45], [23.40, 90.60], [23.24, 90.58], [23.10, 90.42], [23.15, 90.22], [23.32, 90.25], [23.38, 90.45]
    ],
    riverSalinityPpt: 0.11,
    shallowGwSalinityPpt: 0.35,
    deepGwSalinityPpt: 0.70,
    aquiferDepthM: "Shallow: 20-50m | Deep: 160-220m",
    drinkingSafety: "EXCELLENT: Distinct deep groundwater freshwater lens (<0.7 ppt).",
    hydrogeologySummary: "Padma floodplain sands with strong vertical recharge protecting deeper Pleistocene layers."
  },
  {
    id: "chandpur",
    name: "Chandpur",
    bengaliName: "চাঁদপুর",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.18,
    soilEc: 0.3,
    areaKm2: 430.0,
    population: 460000,
    polders: ["Chandpur Irrigation Project (CIP) Polder"],
    intakeRisk: "Padma-Meghna confluence. High volume freshwater discharge prevents marine ingress.",
    boroVulnerability: "Very low; premier freshwater Hilsha estuary and major irrigation scheme.",
    sluiceAdvisory: "Chandpur Irrigation Project (CIP) pumping station operates continuously.",
    recommendedCrops: ["High-yield Boro (BRRI dhan29)", "Soybean", "Maize", "Chili"],
    associatedStationIds: ["chandpur-gw"],
    bounds: [[23.15, 90.55], [23.35, 90.78]],
    center: [23.23, 90.66],
    coordinates: [
      [23.35, 90.62], [23.32, 90.75], [23.18, 90.78], [23.16, 90.60], [23.25, 90.58], [23.35, 90.62]
    ],
    riverSalinityPpt: 0.11,
    shallowGwSalinityPpt: 0.25,
    deepGwSalinityPpt: 1.10,
    aquiferDepthM: "Shallow: 20-60m | Deep: 180-240m",
    drinkingSafety: "POTABLE: Low salinity in both surface and groundwater.",
    hydrogeologySummary: "Eastern bank of Lower Meghna estuary. Robust fluvial flushing."
  },
  {
    id: "haimchar",
    name: "Haimchar",
    bengaliName: "হাইমচর",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.21,
    soilEc: 0.5,
    areaKm2: 174.0,
    population: 130000,
    polders: ["Haimchar Riverbank Embankment"],
    intakeRisk: "Lower Meghna eastern corridor. Stable fresh to brackish boundary.",
    boroVulnerability: "Low risk; slight seasonal backwater during dry season neap tides.",
    sluiceAdvisory: "Gravity sluices active; intake safe for agriculture.",
    recommendedCrops: ["BRRI dhan67", "Soybean", "Groundnut", "Sesame"],
    associatedStationIds: ["haimchar-sw"],
    bounds: [[22.98, 90.55], [23.18, 90.80]],
    center: [23.07, 90.64],
    coordinates: [
      [23.16, 90.60], [23.18, 90.78], [23.02, 90.80], [23.00, 90.62], [23.10, 90.60], [23.16, 90.60]
    ],
    riverSalinityPpt: 0.13,
    shallowGwSalinityPpt: 0.55,
    deepGwSalinityPpt: 1.60,
    aquiferDepthM: "Shallow: 25-60m | Deep: 200-260m",
    drinkingSafety: "POTABLE: Deep tube-wells yield fresh drinking water (1.6 ppt).",
    hydrogeologySummary: "Transition from fluvial Meghna into estuarine mixing zone."
  },
  {
    id: "raipur",
    name: "Raipur",
    bengaliName: "রায়পুর",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.24,
    soilEc: 0.7,
    areaKm2: 247.0,
    population: 280000,
    polders: ["Raipur-Lakshmipur Polder"],
    intakeRisk: "Eastern estuary floodplain; surface water largely fresh in early dry season.",
    boroVulnerability: "Low to moderate; late dry season (April) capillary rise.",
    sluiceAdvisory: "Conserve canal water by mid-March before tide height drops.",
    recommendedCrops: ["Soybean (major national hub)", "Boro rice", "Betel nut", "Coconut"],
    associatedStationIds: ["raipur-gw"],
    bounds: [[22.95, 90.68], [23.12, 90.85]],
    center: [23.03, 90.76],
    coordinates: [
      [23.10, 90.72], [23.12, 90.82], [22.98, 90.85], [22.96, 90.70], [23.02, 90.70], [23.10, 90.72]
    ],
    riverSalinityPpt: 0.15,
    shallowGwSalinityPpt: 0.80,
    deepGwSalinityPpt: 2.20,
    aquiferDepthM: "Shallow: 25-55m | Deep: 220-280m",
    drinkingSafety: "POTABLE: Shallow aquifer safe for agriculture, deep aquifer 2.2 ppt.",
    hydrogeologySummary: "Lakshmipur coastal plain with moderate deep aquifer mineralization."
  },
  {
    id: "lakshmipur",
    name: "Lakshmipur Sadar",
    bengaliName: "লক্ষ্মীপুর সদর",
    riskTier: "Low",
    color: "#65a30d",
    fillColor: "#65a30d",
    avgEc: 0.40,
    soilEc: 1.1,
    areaKm2: 514.0,
    population: 685000,
    polders: ["Lakshmipur Coastal Polder 36/1"],
    intakeRisk: "Lower Meghna tidal interface. River water fresh in monsoon, rising to 0.4-0.8 dS/m in April.",
    boroVulnerability: "Moderate; requires salt-tolerant crop selection in southern unions.",
    sluiceAdvisory: "Close flap gates during spring tide surges.",
    recommendedCrops: ["Soybean", "BRRI dhan67", "BINA dhan-10", "Chili"],
    associatedStationIds: ["lakshmipur-sw"],
    bounds: [[22.78, 90.70], [23.00, 90.92]],
    center: [22.94, 90.82],
    coordinates: [
      [22.98, 90.70], [22.98, 90.85], [22.85, 90.92], [22.78, 90.78], [22.88, 90.72], [22.98, 90.70]
    ],
    riverSalinityPpt: 0.25,
    shallowGwSalinityPpt: 1.40,
    deepGwSalinityPpt: 2.50,
    aquiferDepthM: "Shallow: 30-60m | Deep: 220-300m",
    drinkingSafety: "ACCEPTABLE: Deep tube-wells provide potable water across urban core.",
    hydrogeologySummary: "Eastern delta margin. Saline groundwaters in upper 40m, deeper aquifers semi-confined."
  },
  {
    id: "wazirpur",
    name: "Wazirpur",
    bengaliName: "উজিরপুর",
    riskTier: "Very Low",
    color: "#15803d",
    fillColor: "#15803d",
    avgEc: 0.22,
    soilEc: 0.5,
    areaKm2: 248.0,
    population: 240000,
    polders: ["Sandhya River Embankment", "Barishal Polder 42"],
    intakeRisk: "Northwest Barishal district along Sandhya river. Low salinity corridor (<0.2 ppt).",
    boroVulnerability: "Low; abundant perennial fresh canal water.",
    sluiceAdvisory: "Open gravity intake; excellent conditions for Boro rice.",
    recommendedCrops: ["BRRI dhan28 / 29", "Guava (famous floating market)", "Betel Leaf"],
    associatedStationIds: ["wazirpur-sw"],
    bounds: [[22.72, 90.12], [22.95, 90.35]],
    center: [22.81, 90.24],
    coordinates: [
      [22.95, 90.12], [22.92, 90.35], [22.75, 90.32], [22.72, 90.18], [22.82, 90.15], [22.95, 90.12]
    ],
    riverSalinityPpt: 0.14,
    shallowGwSalinityPpt: 0.65,
    deepGwSalinityPpt: 1.40,
    aquiferDepthM: "Shallow: 20-50m | Deep: 180-240m",
    drinkingSafety: "SAFE / POTABLE: Both surface rivers and aquifers suitable for direct consumption.",
    hydrogeologySummary: "Central-western delta fluvial zone with high freshwater recharge rates."
  },
  {
    id: "barishal",
    name: "Barishal Sadar",
    bengaliName: "বরিশাল সদর",
    riskTier: "Low",
    color: "#65a30d",
    fillColor: "#65a30d",
    avgEc: 0.35,
    soilEc: 0.9,
    areaKm2: 324.0,
    population: 530000,
    polders: ["Kirtonkhola Embankment", "Barishal Polder 43/1"],
    intakeRisk: "Kirtonkhola river passes urban intake. Slightly brackish in late spring tide (0.2-0.4 ppt).",
    boroVulnerability: "Low to moderate; core agricultural and trading hub of southern delta.",
    sluiceAdvisory: "Regulate sluices during astronomical high tides in April.",
    recommendedCrops: ["BRRI dhan29", "BRRI dhan67", "Paddy Nursery", "Vegetables"],
    associatedStationIds: ["barishal-sw", "barishal-gw"],
    bounds: [[22.56, 90.24], [22.80, 90.46]],
    center: [22.70, 90.36],
    coordinates: [
      [22.78, 90.28], [22.80, 90.45], [22.58, 90.45], [22.56, 90.26], [22.70, 90.24], [22.78, 90.28]
    ],
    riverSalinityPpt: 0.22,
    shallowGwSalinityPpt: 1.20,
    deepGwSalinityPpt: 2.10,
    aquiferDepthM: "Shallow: 25-60m | Deep: 200-280m",
    drinkingSafety: "POTABLE: Deep tube-wells safely supply Barishal City Corporation.",
    hydrogeologySummary: "Central deltaic floodplain. Pleistocene aquifers yield fresh water under thick clays."
  },
  {
    id: "bhola",
    name: "Bhola Sadar",
    bengaliName: "ভোলা সদর",
    riskTier: "Moderate",
    color: "#eab308",
    fillColor: "#eab308",
    avgEc: 1.35,
    soilEc: 2.2,
    areaKm2: 413.0,
    population: 430000,
    polders: ["Bhola North Polder 56/1", "Tentulia River Embankment"],
    intakeRisk: "Northern Bhola Island bounded by Tentulia (west) and Meghna (east). Salinity oscillates 0.8-1.5 ppt.",
    boroVulnerability: "Moderate; groundwater pumping causes localized upconing.",
    sluiceAdvisory: "Strict gate schedule; store Tentulia freshwater during ebb tide.",
    recommendedCrops: ["BRRI dhan67", "BRRI dhan74", "Sunflower", "Mustard", "Watermelon"],
    associatedStationIds: ["bhola-north-sw"],
    bounds: [[22.48, 90.52], [22.88, 90.80]],
    center: [22.68, 90.65],
    coordinates: [
      [22.85, 90.62], [22.88, 90.72], [22.65, 90.80], [22.50, 90.75], [22.48, 90.58], [22.65, 90.52], [22.85, 90.62]
    ],
    riverSalinityPpt: 0.85,
    shallowGwSalinityPpt: 2.80,
    deepGwSalinityPpt: 2.90,
    aquiferDepthM: "Shallow: 30-70m | Deep: 220-300m",
    drinkingSafety: "MODERATE RISK: Shallow aquifer brackish. Deep Pleistocene wellfields safe with regular EC testing.",
    hydrogeologySummary: "Deltaic island aquifer system isolated by deep saline river channels."
  },
  {
    id: "charfasson",
    name: "Charfasson",
    bengaliName: "চরফ্যাশন",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 13.6,
    soilEc: 12.4,
    areaKm2: 1106.0,
    population: 450000,
    polders: ["Polder 54 (Charfasson)", "Kukri Mukri Island Embankment"],
    intakeRisk: "Direct marine exposure to Bay of Bengal at southern tip of Bhola Island. Surface salinity 8.5-16.0 ppt.",
    boroVulnerability: "Severe agricultural hazard; traditional Boro rice fails completely without deep tube-well irrigation.",
    sluiceAdvisory: "All sea-facing sluice gates permanently locked against marine spring surge.",
    recommendedCrops: ["BINA dhan-10", "BRRI dhan67 (with deep GW)", "Crab fattening", "Watermelon"],
    associatedStationIds: ["charfasson-sw", "charfasson-deep-gw"],
    bounds: [[21.75, 90.55], [22.48, 90.85]],
    center: [22.18, 90.71],
    coordinates: [
      [22.48, 90.58], [22.50, 90.75], [22.40, 90.82], [22.15, 90.85], [21.85, 90.80], [21.82, 90.68], [22.10, 90.60], [22.38, 90.55], [22.48, 90.58]
    ],
    riverSalinityPpt: 8.50,
    shallowGwSalinityPpt: 14.50,
    deepGwSalinityPpt: 4.80,
    aquiferDepthM: "Shallow: 30-80m | Deep: 280-380m",
    drinkingSafety: "CRITICAL: Shallow groundwater completely saline (14.5 ppt). Drinking water strictly dependent on deep (>300m) confined aquifers.",
    hydrogeologySummary: "Southern estuarine barrier island. Acute marine saltwater wedge penetrating shallow Holocene sands."
  },
  {
    id: "mirzaganj",
    name: "Mirzaganj",
    bengaliName: "মির্জাগঞ্জ",
    riskTier: "Moderate",
    color: "#eab308",
    fillColor: "#eab308",
    avgEc: 2.85,
    soilEc: 3.4,
    areaKm2: 175.0,
    population: 125000,
    polders: ["Mirzaganj Polder 44"],
    intakeRisk: "Payra-Bishkhali interfluvial plain. River salinity reaches 1.8-3.0 ppt during dry season.",
    boroVulnerability: "Moderate to high; salt accumulation in topsoil during dry sunny spells.",
    sluiceAdvisory: "Flush polder canals during lowest low tides to evacuate accumulated salts.",
    recommendedCrops: ["BRRI dhan67", "BRRI dhan47", "Grasspea (Khesari)", "Chili"],
    associatedStationIds: ["mirzaganj-sw"],
    bounds: [[22.26, 90.15], [22.48, 90.30]],
    center: [22.36, 90.24],
    coordinates: [
      [22.46, 90.18], [22.48, 90.30], [22.28, 90.30], [22.26, 90.18], [22.38, 90.15], [22.46, 90.18]
    ],
    riverSalinityPpt: 1.80,
    shallowGwSalinityPpt: 4.50,
    deepGwSalinityPpt: 3.10,
    aquiferDepthM: "Shallow: 30-70m | Deep: 220-300m",
    drinkingSafety: "WARNING: Shallow wells exceed drinking limits. Deep wells (250m) yield marginal to acceptable water (3.1 ppt).",
    hydrogeologySummary: "Interfluvial delta plain with upward capillary salt flux from saline shallow groundwater."
  },
  {
    id: "patuakhali",
    name: "Patuakhali Sadar",
    bengaliName: "পটুয়াখালী সদর",
    riskTier: "High",
    color: "#ea580c",
    fillColor: "#ea580c",
    avgEc: 6.0,
    soilEc: 8.5,
    areaKm2: 382.0,
    population: 330000,
    polders: ["Patuakhali Polder 45", "Laukathi River Embankment"],
    intakeRisk: "Laukathi & Payra rivers carry significant brackish water (3.8-7.5 ppt in March-May).",
    boroVulnerability: "High; severe root toxicity on conventional rice cultivars.",
    sluiceAdvisory: "Strict prohibition of raw river intake during flood tides; utilize freshwater pond storage.",
    recommendedCrops: ["BRRI dhan67", "BINA dhan-8", "Sunflower", "Watermelon", "Brackish Aquaculture"],
    associatedStationIds: ["patuakhali-sw", "patuakhali-deep-gw"],
    bounds: [[22.22, 90.25], [22.52, 90.46]],
    center: [22.35, 90.35],
    coordinates: [
      [22.48, 90.30], [22.52, 90.45], [22.25, 90.44], [22.24, 90.30], [22.38, 90.28], [22.48, 90.30]
    ],
    riverSalinityPpt: 3.80,
    shallowGwSalinityPpt: 12.00,
    deepGwSalinityPpt: 4.50,
    aquiferDepthM: "Shallow: 30-80m | Deep: 260-340m",
    drinkingSafety: "HIGH RISK: Shallow aquifer hyper-saline (12 ppt). Deep municipal production wells required (>280m).",
    hydrogeologySummary: "South-central delta zone. Semi-confined Pleistocene aquifer separated by regional clay layer."
  },
  {
    id: "barguna",
    name: "Barguna Sadar",
    bengaliName: "বরগুনা সদর",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 11.5,
    soilEc: 10.2,
    areaKm2: 454.0,
    population: 275000,
    polders: ["Polder 43/2", "Payra-Bishkhali Coastal Polder"],
    intakeRisk: "Payra & Bishkhali estuarine confluence. Marine tidal surge penetrates deep inland (7.2-12.0 ppt).",
    boroVulnerability: "Very High; agricultural soil salinization causes severe seedling withering.",
    sluiceAdvisory: "Keep all coastal embankment sluices closed throughout spring tides.",
    recommendedCrops: ["Salt-tolerant Boro (BRRI dhan67 / 97)", "Watermelon", "Shrimp / Crab", "Sunflower"],
    associatedStationIds: ["barguna-sw", "barguna-gw"],
    bounds: [[21.98, 90.00], [22.28, 90.20]],
    center: [22.15, 90.12],
    coordinates: [
      [22.28, 90.05], [22.28, 90.20], [22.05, 90.20], [21.98, 90.08], [22.12, 90.02], [22.28, 90.05]
    ],
    riverSalinityPpt: 7.20,
    shallowGwSalinityPpt: 13.50,
    deepGwSalinityPpt: 5.20,
    aquiferDepthM: "Shallow: 25-75m | Deep: 280-360m",
    drinkingSafety: "VERY HIGH RISK: Shallow groundwater undrinkable (13.5 ppt). Rainwater harvesting and deep wells required.",
    hydrogeologySummary: "Southwestern coastal delta. Direct marine saltwater intrusion into shallow aquifer; deep aquifer semi-saline."
  },
  {
    id: "amtali",
    name: "Amtali",
    bengaliName: "আমতলী",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 14.8,
    soilEc: 11.8,
    areaKm2: 720.0,
    population: 270000,
    polders: ["Amtali Coastal Polder 48", "Polder 47/2"],
    intakeRisk: "Intense estuarine salinity from Payra river (9.5-15.0 ppt). River water totally unusable for irrigation.",
    boroVulnerability: "Extreme; soil crusting and white salt deposits form on unmulched fields.",
    sluiceAdvisory: "Permanently seal gravity intakes from river; store pond rainwater under shade.",
    recommendedCrops: ["BRRI dhan97 / 99", "Watermelon (hybrid)", "Grasspea", "Bagda shrimp"],
    associatedStationIds: ["amtali-sw", "amtali-gw"],
    bounds: [[22.00, 90.15], [22.28, 90.40]],
    center: [22.13, 90.25],
    coordinates: [
      [22.25, 90.20], [22.25, 90.40], [22.05, 90.38], [22.02, 90.20], [22.15, 90.18], [22.25, 90.20]
    ],
    riverSalinityPpt: 9.50,
    shallowGwSalinityPpt: 14.00,
    deepGwSalinityPpt: 4.80,
    aquiferDepthM: "Shallow: 30-80m | Deep: 290-370m",
    drinkingSafety: "CRITICAL: Surface water and upper aquifer hyper-saline. Severe potable water scarcity.",
    hydrogeologySummary: "Southern coastal inter-tidal plain. Intense seawater seepage into permeable topsoil."
  },
  {
    id: "kalapara",
    name: "Kalapara (Kuakata Coastal Fringe)",
    bengaliName: "কলাপাড়া (কুয়াকাটা উপকূল)",
    riskTier: "Very High",
    color: "#dc2626",
    fillColor: "#dc2626",
    avgEc: 16.8,
    soilEc: 14.5,
    areaKm2: 491.0,
    population: 240000,
    polders: ["Kalapara Polder 47/1", "Polder 48", "Kuakata Sea Dyke"],
    intakeRisk: "Southernmost maritime tip of delta on Bay of Bengal. River and estuarine salinity peaks at 14.5-17.5 ppt.",
    boroVulnerability: "Catastrophic if raw surface water used. Unique local occurrence of deep Pleistocene freshwater lens (2.4 ppt).",
    sluiceAdvisory: "Reinforce coastal dykes; close all sluices against daily astronomical sea tides.",
    recommendedCrops: ["Coastal Watermelon", "BINA dhan-10", "Marine Fish / Crab", "Betel Leaf (covered pan)"],
    associatedStationIds: ["kalapara-marine-sw", "kalapara-fresh-lens-gw"],
    bounds: [[21.80, 90.10], [22.10, 90.38]],
    center: [21.98, 90.24],
    coordinates: [
      [22.05, 90.12], [22.05, 90.38], [21.82, 90.35], [21.82, 90.18], [21.85, 90.15], [22.05, 90.12]
    ],
    riverSalinityPpt: 14.50,
    shallowGwSalinityPpt: 15.20,
    deepGwSalinityPpt: 2.40,
    aquiferDepthM: "Shallow: 20-80m | Deep: 300-400m",
    drinkingSafety: "SPECIAL HYDROGEOLOGY: Surface (14.5 ppt) and shallow GW (15.2 ppt) completely saline; however, deep confined Pleistocene aquifer contains a localized FRESHWATER LENS (2.4 ppt) discovered by hydrogeologists.",
    hydrogeologySummary: "Southern littoral delta fringe. Marine tidal wedge on top, but isolated ancient Pleistocene paleo-channel provides fresh water at >320m depth."
  }
];

// Master unified list combining coastal delta and khulna regional basins
export const ALL_STUDY_REGIONS: KhulnaRegion[] = [
  ...COASTAL_DELTA_UPAZILAS,
  ...KHULNA_UPAZILA_REGIONS,
];

// -------------------------------------------------------------
// 9. CONTINUOUS ISOHALINE CONTOUR GRADIENT BANDS (3 DOMAINS)
// Replicating the scientific smooth spatial interpolation from the publication
// -------------------------------------------------------------
export interface IsohalineContourBand {
  tierIndex: number;
  label: string;
  color: string;
  fillColor: string;
  coordinates: [number, number][];
}

export const DOMAIN_ISOHALINES: Record<HydrologicDomain, IsohalineContourBand[]> = {
  // (a) Salinity in River Water (ppt)
  river: [
    {
      tierIndex: 5,
      label: "4.45 to 17.20 ppt",
      color: "#d92526",
      fillColor: "#d92526",
      coordinates: [
        [21.70, 89.15],
        [21.70, 89.75],
        [22.42, 89.75],
        [22.46, 89.60],
        [22.42, 89.45],
        [22.40, 89.30],
        [22.38, 89.15],
        [21.70, 89.15],
      ],
    },
    {
      tierIndex: 4,
      label: "1.20 to 4.45 ppt",
      color: "#e65124",
      fillColor: "#e65124",
      coordinates: [
        [22.38, 89.15],
        [22.40, 89.30],
        [22.42, 89.45],
        [22.46, 89.60],
        [22.42, 89.75],
        [22.68, 89.75],
        [22.65, 89.55],
        [22.62, 89.35],
        [22.60, 89.15],
        [22.38, 89.15],
      ],
    },
    {
      tierIndex: 3,
      label: "0.38 to 1.20 ppt",
      color: "#f5a623",
      fillColor: "#f5a623",
      coordinates: [
        [22.60, 89.15],
        [22.62, 89.35],
        [22.65, 89.55],
        [22.68, 89.75],
        [22.82, 89.75],
        [22.78, 89.55],
        [22.76, 89.35],
        [22.74, 89.15],
        [22.60, 89.15],
      ],
    },
    {
      tierIndex: 2,
      label: "0.16 to 0.38 ppt",
      color: "#fbf089",
      fillColor: "#fbf089",
      coordinates: [
        [22.74, 89.15],
        [22.76, 89.35],
        [22.78, 89.55],
        [22.82, 89.75],
        [22.92, 89.75],
        [22.90, 89.55],
        [22.88, 89.35],
        [22.86, 89.15],
        [22.74, 89.15],
      ],
    },
    {
      tierIndex: 1,
      label: "0.11 to 0.16 ppt",
      color: "#7eb8a8",
      fillColor: "#7eb8a8",
      coordinates: [
        [22.86, 89.15],
        [22.88, 89.35],
        [22.90, 89.55],
        [22.92, 89.75],
        [23.02, 89.75],
        [23.00, 89.55],
        [22.98, 89.35],
        [22.96, 89.15],
        [22.86, 89.15],
      ],
    },
    {
      tierIndex: 0,
      label: "0.10 to 0.11 ppt",
      color: "#1b75bb",
      fillColor: "#1b75bb",
      coordinates: [
        [22.96, 89.15],
        [22.98, 89.35],
        [23.00, 89.55],
        [23.02, 89.75],
        [23.15, 89.75],
        [23.15, 89.15],
        [22.96, 89.15],
      ],
    },
  ],

  // (b) Salinity in Shallow Groundwater (ppt)
  shallow_gw: [
    {
      tierIndex: 5,
      label: "10 to 16 ppt",
      color: "#d92526",
      fillColor: "#d92526",
      coordinates: [
        [21.70, 89.15],
        [21.70, 89.75],
        [22.60, 89.75],
        [22.62, 89.55],
        [22.58, 89.35],
        [22.55, 89.15],
        [21.70, 89.15],
      ],
    },
    {
      tierIndex: 4,
      label: "5 to 10 ppt",
      color: "#e65124",
      fillColor: "#e65124",
      coordinates: [
        [22.55, 89.15],
        [22.58, 89.35],
        [22.62, 89.55],
        [22.60, 89.75],
        [22.78, 89.75],
        [22.75, 89.55],
        [22.72, 89.35],
        [22.70, 89.15],
        [22.55, 89.15],
      ],
    },
    {
      tierIndex: 3,
      label: "2 to 5 ppt",
      color: "#f5a623",
      fillColor: "#f5a623",
      coordinates: [
        [22.70, 89.15],
        [22.72, 89.35],
        [22.75, 89.55],
        [22.78, 89.75],
        [22.88, 89.75],
        [22.86, 89.55],
        [22.84, 89.35],
        [22.82, 89.15],
        [22.70, 89.15],
      ],
    },
    {
      tierIndex: 2,
      label: "1 to 2 ppt",
      color: "#fbf089",
      fillColor: "#fbf089",
      coordinates: [
        [22.82, 89.15],
        [22.84, 89.35],
        [22.86, 89.55],
        [22.88, 89.75],
        [22.96, 89.75],
        [22.95, 89.55],
        [22.93, 89.35],
        [22.92, 89.15],
        [22.82, 89.15],
      ],
    },
    {
      tierIndex: 1,
      label: "0.5 to 1 ppt",
      color: "#7eb8a8",
      fillColor: "#7eb8a8",
      coordinates: [
        [22.92, 89.15],
        [22.93, 89.35],
        [22.95, 89.55],
        [22.96, 89.75],
        [23.05, 89.75],
        [23.04, 89.55],
        [23.02, 89.35],
        [23.00, 89.15],
        [22.92, 89.15],
      ],
    },
    {
      tierIndex: 0,
      label: "0.1 to 0.5 ppt",
      color: "#1b75bb",
      fillColor: "#1b75bb",
      coordinates: [
        [23.00, 89.15],
        [23.02, 89.35],
        [23.04, 89.55],
        [23.05, 89.75],
        [23.15, 89.75],
        [23.15, 89.15],
        [23.00, 89.15],
      ],
    },
  ],

  // (c) Salinity in Deep Groundwater (ppt)
  deep_gw: [
    {
      tierIndex: 5,
      label: "5 to 10 ppt",
      color: "#d92526",
      fillColor: "#d92526",
      coordinates: [
        [21.70, 89.15],
        [21.70, 89.75],
        [22.25, 89.75],
        [22.24, 89.55],
        [22.22, 89.35],
        [22.20, 89.15],
        [21.70, 89.15],
      ],
    },
    {
      tierIndex: 4,
      label: "4 to 5 ppt",
      color: "#e65124",
      fillColor: "#e65124",
      coordinates: [
        [22.20, 89.15],
        [22.22, 89.35],
        [22.24, 89.55],
        [22.25, 89.75],
        [22.42, 89.75],
        [22.40, 89.55],
        [22.38, 89.35],
        [22.36, 89.15],
        [22.20, 89.15],
      ],
    },
    {
      tierIndex: 3,
      label: "3 to 4 ppt",
      color: "#f5a623",
      fillColor: "#f5a623",
      coordinates: [
        [22.36, 89.15],
        [22.38, 89.35],
        [22.40, 89.55],
        [22.42, 89.75],
        [22.58, 89.75],
        [22.56, 89.55],
        [22.54, 89.35],
        [22.52, 89.15],
        [22.36, 89.15],
      ],
    },
    {
      tierIndex: 2,
      label: "2.6 to 3 ppt",
      color: "#fbf089",
      fillColor: "#fbf089",
      coordinates: [
        [22.52, 89.15],
        [22.54, 89.35],
        [22.56, 89.55],
        [22.58, 89.75],
        [22.70, 89.75],
        [22.68, 89.55],
        [22.66, 89.35],
        [22.65, 89.15],
        [22.52, 89.15],
      ],
    },
    {
      tierIndex: 1,
      label: "2 to 2.6 ppt",
      color: "#7eb8a8",
      fillColor: "#7eb8a8",
      coordinates: [
        [22.65, 89.15],
        [22.66, 89.35],
        [22.68, 89.55],
        [22.70, 89.75],
        [22.88, 89.75],
        [22.86, 89.55],
        [22.85, 89.35],
        [22.84, 89.15],
        [22.65, 89.15],
      ],
    },
    {
      tierIndex: 0,
      label: "0.4 to 2 ppt",
      color: "#1b75bb",
      fillColor: "#1b75bb",
      coordinates: [
        [22.84, 89.15],
        [22.85, 89.35],
        [22.86, 89.55],
        [22.88, 89.75],
        [23.15, 89.75],
        [23.15, 89.15],
        [22.84, 89.15],
      ],
    },
  ],
};

// -------------------------------------------------------------
// 10. HYDROGRAPHIC RIVER WATER NETWORK (CRISP VECTOR CHANNELS)
// -------------------------------------------------------------
export interface HydroRiver {
  id: string;
  name: string;
  bengaliName: string;
  coordinates: [number, number][];
  labelCoord: [number, number];
  width: number;
}

export const KHULNA_RIVER_SYSTEM: HydroRiver[] = [
  {
    id: "passur",
    name: "Passur River",
    bengaliName: "পশুর নদী",
    width: 6,
    coordinates: [
      [22.825, 89.575],
      [22.808, 89.580],
      [22.760, 89.575],
      [22.710, 89.570],
      [22.620, 89.578],
      [22.560, 89.585],
      [22.520, 89.595],
      [22.464, 89.600],
      [22.380, 89.605],
      [22.320, 89.620],
      [22.250, 89.610],
      [22.120, 89.625],
      [21.980, 89.610],
      [21.850, 89.595],
      [21.750, 89.580],
    ],
    labelCoord: [22.48, 89.61],
  },
  {
    id: "shibsa",
    name: "Shibsa River",
    bengaliName: "শিবসা নদী",
    width: 5,
    coordinates: [
      [22.730, 89.390],
      [22.650, 89.410],
      [22.580, 89.440],
      [22.480, 89.455],
      [22.380, 89.440],
      [22.280, 89.410],
      [22.180, 89.390],
      [22.050, 89.370],
      [21.800, 89.350],
    ],
    labelCoord: [22.42, 89.43],
  },
  {
    id: "rupsha",
    name: "Rupsha River",
    bengaliName: "রূপসা নদী",
    width: 4,
    coordinates: [
      [22.920, 89.530],
      [22.870, 89.560],
      [22.825, 89.575],
      [22.808, 89.580],
      [22.760, 89.575],
    ],
    labelCoord: [22.84, 89.58],
  },
  {
    id: "kobodak",
    name: "Kobodak River",
    bengaliName: "কপোতাক্ষ নদ",
    width: 3.5,
    coordinates: [
      [22.850, 89.260],
      [22.750, 89.280],
      [22.650, 89.240],
      [22.520, 89.230],
      [22.400, 89.260],
      [22.280, 89.270],
      [22.150, 89.280],
    ],
    labelCoord: [22.56, 89.23],
  },
  {
    id: "kazibacha",
    name: "Kazibacha River",
    bengaliName: "কাজীবাছা নদী",
    width: 3.5,
    coordinates: [
      [22.780, 89.510],
      [22.750, 89.530],
      [22.700, 89.540],
      [22.660, 89.530],
      [22.620, 89.560],
    ],
    labelCoord: [22.71, 89.535],
  },
  {
    id: "bhairab",
    name: "Bhairab River",
    bengaliName: "ভৈরব নদী",
    width: 4,
    coordinates: [
      [23.080, 89.460],
      [23.020, 89.500],
      [22.960, 89.520],
      [22.920, 89.530],
    ],
    labelCoord: [23.01, 89.49],
  },
  {
    id: "meghna",
    name: "Meghna Estuary",
    bengaliName: "মেঘনা নদী ও মোহনা",
    width: 7,
    coordinates: [
      [23.40, 90.60],
      [23.25, 90.62],
      [23.10, 90.65],
      [22.85, 90.75],
      [22.55, 90.88],
      [22.20, 90.95],
      [21.80, 90.90],
    ],
    labelCoord: [22.90, 90.72],
  },
  {
    id: "tentulia",
    name: "Tentulia River",
    bengaliName: "তেঁতুলিয়া নদী",
    width: 5,
    coordinates: [
      [22.80, 90.52],
      [22.60, 90.54],
      [22.35, 90.53],
      [22.05, 90.55],
      [21.80, 90.60],
    ],
    labelCoord: [22.45, 90.53],
  },
  {
    id: "payra",
    name: "Payra & Kirtonkhola River",
    bengaliName: "পায়রা ও কীর্তনখোলা",
    width: 4.5,
    coordinates: [
      [22.75, 90.37],
      [22.55, 90.36],
      [22.35, 90.33],
      [22.10, 90.28],
      [21.82, 90.22],
    ],
    labelCoord: [22.40, 90.35],
  },
  {
    id: "bishkhali",
    name: "Bishkhali River",
    bengaliName: "বিষখালী নদী",
    width: 4,
    coordinates: [
      [22.60, 90.22],
      [22.40, 90.18],
      [22.15, 90.12],
      [21.90, 90.10],
    ],
    labelCoord: [22.25, 90.15],
  },
];

// Southern Bay of Bengal label placement
export const BAY_OF_BENGAL_LOCATION: [number, number] = [21.68, 89.46];

// -------------------------------------------------------------
// 11. HELPER FUNCTIONS FOR DOMAIN LOOKUP & CONVERSION
// -------------------------------------------------------------
export function getRegionDomainValue(region: KhulnaRegion, domain: HydrologicDomain): number {
  switch (domain) {
    case "river":
      return region.riverSalinityPpt;
    case "shallow_gw":
      return region.shallowGwSalinityPpt;
    case "deep_gw":
      return region.deepGwSalinityPpt;
    default:
      return region.riverSalinityPpt;
  }
}

export function getDomainTier(value: number, domain: HydrologicDomain): SalinityTier {
  const config = DOMAIN_CONFIGS[domain];
  for (let i = config.tiers.length - 1; i >= 0; i--) {
    if (value >= config.tiers[i].min) {
      return config.tiers[i];
    }
  }
  return config.tiers[0];
}

export function getRegionDomainColor(region: KhulnaRegion, domain: HydrologicDomain): string {
  const val = getRegionDomainValue(region, domain);
  const tier = getDomainTier(val, domain);
  return tier.fillColor;
}

export function convertPptToEc(ppt: number): number {
  return Number((ppt * 1.5625).toFixed(2));
}

export function convertEcToPpt(ec: number): number {
  return Number((ec * 0.64).toFixed(2));
}

