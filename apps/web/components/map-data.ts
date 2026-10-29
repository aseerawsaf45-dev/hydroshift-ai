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
}

export interface MapWrapperProps {
  selectedSiteId?: string | null;
  onSelectSite?: (site: Site | null) => void;
  selectedRegionId?: string | null;
  onSelectRegion?: (region: KhulnaRegion | null) => void;
  showRiskChoropleth?: boolean;
  showSwot?: boolean;
  showGauges?: boolean;
  showSalinityFront?: boolean;
  showIsohalines?: boolean;
  showPolders?: boolean;
  showThalweg?: boolean;
  showLabels?: boolean;
  basemap?: "satellite" | "dark" | "topo" | "osm";
  horizon?: "now" | "7d" | "14d";
  searchQuery?: string;
  riskFilter?: "all" | "critical" | "warning" | "nominal";
  flyToCoords?: [number, number] | null;
  onSelectCorridor?: (corridorName: string) => void;
  onSelectPolder?: (polder: PolderPolygon | null) => void;
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
// 4. PROFESSIONAL GIS BASEMAP DEFINITIONS
// -------------------------------------------------------------
export const BASEMAP_TILES = {
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
  },
];

