"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Waves,
  Sprout,
  GitCompare,
  LineChart,
  ShieldAlert,
  ArrowRight,
  Database,
  BrainCircuit,
  FileText,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchItem {
  id: string;
  title: string;
  category: "Upazila / Location" | "River & Estuary" | "Decision Tool" | "Polder Embankment";
  description: string;
  badge?: string;
  href: string;
  icon: any;
}

const SEARCH_DATABASE: SearchItem[] = [
  // Upazilas
  {
    id: "loc-dacope",
    title: "Dacope (দাকোপ)",
    category: "Upazila / Location",
    description: "High salinity exposure zone. Polders 31, 32, 33. Passur river corridor.",
    badge: "EC: 6.8 - 14.5 dS/m",
    href: "/app/crop-rotation",
    icon: MapPin,
  },
  {
    id: "loc-koyra",
    title: "Koyra (কয়রা)",
    category: "Upazila / Location",
    description: "Southernmost coastal boundary adjacent to Sundarbans. Polder 14/1.",
    badge: "EC: 9.5 - 19.2 dS/m",
    href: "/app/crop-rotation",
    icon: MapPin,
  },
  {
    id: "loc-paikgachha",
    title: "Paikgachha (পাইকগাছা)",
    category: "Upazila / Location",
    description: "Shibsa & Kobadak estuarine junction. Polder 22. Major shrimp gher zone.",
    badge: "EC: 5.1 - 12.8 dS/m",
    href: "/app/crop-rotation",
    icon: MapPin,
  },
  {
    id: "loc-batiaghata",
    title: "Batiaghata (বটিয়াঘাটা)",
    category: "Upazila / Location",
    description: "Agricultural buffer zone between Khulna City and coastal Dacope.",
    badge: "EC: 3.2 - 7.5 dS/m",
    href: "/app/map",
    icon: MapPin,
  },
  {
    id: "loc-dumuria",
    title: "Dumuria (ডুমুরিয়া)",
    category: "Upazila / Location",
    description: "Largest upazila. High vegetable and cash crop production. Ghighra khal network.",
    badge: "EC: 2.1 - 5.0 dS/m",
    href: "/app/map",
    icon: MapPin,
  },

  // Rivers
  {
    id: "riv-passur",
    title: "Passur River Corridor (পশুর নদী)",
    category: "River & Estuary",
    description: "Major 82 km tidal navigation channel connecting Khulna to Mongla and the Bay of Bengal.",
    badge: "NASA SWOT Reach: 31241000011",
    href: "/app/scenarios",
    icon: Waves,
  },
  {
    id: "riv-shibsa",
    title: "Shibsa River (শিবসা নদী)",
    category: "River & Estuary",
    description: "Western tidal estuary corridor serving Paikgachha and Koyra polder network.",
    badge: "NASA SWOT Reach: 31241000021",
    href: "/app/scenarios",
    icon: Waves,
  },
  {
    id: "riv-rupsha",
    title: "Rupsha / Bhairab River (রূপসা নদী)",
    category: "River & Estuary",
    description: "Upper freshwater corridor flowing through Khulna metropolitan area.",
    badge: "Potable Intake Zone",
    href: "/app/map",
    icon: Waves,
  },
  {
    id: "riv-gorai",
    title: "Gorai River Conveyance (গড়াই নদী)",
    category: "River & Estuary",
    description: "Main Ganges distributary delivering upstream fresh water to flush coastal salinity.",
    badge: "Freshwater Headwater",
    href: "/app/scenarios",
    icon: Waves,
  },

  // Decision Tools
  {
    id: "tool-croprot",
    title: "Crop Rotation Decision Support System",
    category: "Decision Tool",
    description: "Evaluate 3-season crop sequences by net income (৳ BDT) and Maas-Hoffman salt tolerance.",
    badge: "Interactive DSS",
    href: "/app/crop-rotation",
    icon: Sprout,
  },
  {
    id: "tool-scenarios",
    title: "Scenarios Simulation Studio",
    category: "Decision Tool",
    description: "Simulate storm surges (+1.5m) and Gorai freshwater discharge changes along the estuary.",
    badge: "PINN Hydrodynamics",
    href: "/app/scenarios",
    icon: GitCompare,
  },
  {
    id: "tool-map",
    title: "Interactive GIS Map Explorer",
    category: "Decision Tool",
    description: "High-resolution offline map with kriging salinity heatmaps, rivers, and polders.",
    badge: "Cartographic GIS",
    href: "/app/map",
    icon: Compass,
  },
  {
    id: "tool-forecasts",
    title: "14-Day Estuarine Salinity Forecast",
    category: "Decision Tool",
    description: "AI-driven tidal forecast with 95% conformal uncertainty bands for polder sluice management.",
    badge: "14D Prediction",
    href: "/app/forecasts",
    icon: LineChart,
  },
  {
    id: "tool-models",
    title: "Models & Empirical Benchmarking",
    category: "Decision Tool",
    description: "Hold-out test metrics comparing Plain MLP, Persistence, and Fourier PINN.",
    badge: "NASA Space Apps 2026",
    href: "/app/models",
    icon: BrainCircuit,
  },
  {
    id: "tool-alerts",
    title: "Salinity & Flood Hazard Alerts",
    category: "Decision Tool",
    description: "Active warnings when river salinity exceeds 4.0 dS/m or polder flap gates lock.",
    badge: "Real-time Monitoring",
    href: "/app/alerts",
    icon: ShieldAlert,
  },

  // Polders
  {
    id: "pol-31",
    title: "Polder 31 (Dacope Bajua / Pankhali)",
    category: "Polder Embankment",
    description: "Protected agricultural area with internal retention khals.",
    badge: "Polder 31",
    href: "/app/crop-rotation",
    icon: ShieldAlert,
  },
  {
    id: "pol-32",
    title: "Polder 32 (Dacope Kamarkhola / Sutarkhali)",
    category: "Polder Embankment",
    description: "Vulnerable coastal dyke with automated sluice intake gates.",
    badge: "Polder 32",
    href: "/app/crop-rotation",
    icon: ShieldAlert,
  },
];

interface GlobalSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDialog({ isOpen, onClose }: GlobalSearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? SEARCH_DATABASE.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_DATABASE.slice(0, 7);

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-24 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-[#091522] border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <Search className="w-5 h-5 text-primary shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search upazilas, rivers, polders, or tools (e.g. Dacope, Passur, Crop DSS)..."
            className="w-full bg-transparent border-0 text-white placeholder-muted-foreground text-sm focus:outline-none focus:ring-0"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-muted-foreground hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-muted-foreground hover:text-white transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-1.5 flex-1 scrollbar-thin">
          <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
            {query.trim() ? `Search Results (${filtered.length})` : "Recommended Destinations & Tools"}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-mono">
              No matching upazila, river, or tool found for "{query}".
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/15 transition-all text-left group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground border border-white/10 shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-md">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 ml-3" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-muted-foreground font-mono">
          <span>Navigate with mouse or arrow keys</span>
          <span>HydroShift AI Fast Index</span>
        </div>
      </div>
    </div>
  );
}

export default GlobalSearchDialog;

