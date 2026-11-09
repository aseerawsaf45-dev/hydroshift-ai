"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Waves,
  Sprout,
  ShieldCheck,
  HelpCircle,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Info,
  Droplets,
} from "lucide-react";
import Link from "next/link";

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickGuideModal({ isOpen, onClose }: QuickGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"salinity" | "quickstart" | "glossary" | "actions">("salinity");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#091522] border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-guide-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="quick-guide-title" className="text-base font-bold text-white flex items-center gap-2">
                HydroShift AI — Plain-English Guide
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Beginner Friendly
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Understand salinity levels, coastal polders, and system recommendations in simple terms.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-white/10 px-6 bg-black/20 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab("salinity")}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "salinity"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Salinity Explained</span>
          </button>
          <button
            onClick={() => setActiveTab("quickstart")}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "quickstart"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3-Step Quickstart</span>
          </button>
          <button
            onClick={() => setActiveTab("glossary")}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "glossary"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Simple Glossary</span>
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`py-3 px-3 font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "actions"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Farmer & Community Actions</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed flex-1 scrollbar-thin">
          {/* TAB 1: SALINITY EXPLAINED */}
          {activeTab === "salinity" && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                <p className="font-semibold text-sm text-cyan-300 mb-1">What is Salinity / EC (dS/m)?</p>
                <p className="text-muted-foreground leading-relaxed">
                  Salinity measures how much salt is dissolved in water or soil. We express it as <strong>Electrical Conductivity (EC)</strong> in units of <strong>dS/m</strong> (deciSiemens per meter). Saltwater conducts electricity better than fresh water, so a higher number means saltier water!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 0-1 */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-400 font-mono text-sm">&lt; 1.0 dS/m</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Fresh Water
                      </span>
                    </div>
                    <p className="text-white font-medium text-xs mb-1">100% Safe Drinking &amp; Irrigation</p>
                    <p className="text-muted-foreground text-[11px] leading-normal">
                      Sweet fresh water. Ideal for human consumption, municipal intake, and all standard crops including sensitive vegetables and traditional Boro rice.
                    </p>
                  </div>
                </div>

                {/* 1-4 */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-amber-400 font-mono text-sm">1.0 – 4.0 dS/m</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                        Mild Brackish
                      </span>
                    </div>
                    <p className="text-white font-medium text-xs mb-1">Safe for Standard Boro Rice</p>
                    <p className="text-muted-foreground text-[11px] leading-normal">
                      Slightly brackish. Safe for standard crops. Above 4.0 dS/m, standard winter Boro rice yields start dropping by 12% for each additional unit of salt.
                    </p>
                  </div>
                </div>

                {/* 4-8 */}
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-orange-400 font-mono text-sm">4.0 – 8.0 dS/m</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 font-bold uppercase">
                        Moderate Salinity
                      </span>
                    </div>
                    <p className="text-white font-medium text-xs mb-1">Requires Salt-Tolerant Seeds</p>
                    <p className="text-muted-foreground text-[11px] leading-normal">
                      Dangerous for standard rice, but excellent for BRRI dhan67, BRRI dhan97, BARI Sunflower-2, and Mungbean under rice straw mulch.
                    </p>
                  </div>
                </div>

                {/* >8 */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-rose-400 font-mono text-sm">&gt; 8.0 dS/m</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase">
                        Severe Marine Intrusion
                      </span>
                    </div>
                    <p className="text-white font-medium text-xs mb-1">Shrimp Aquaculture Only</p>
                    <p className="text-muted-foreground text-[11px] leading-normal">
                      Crops fail completely. Suitable only for brackish Bagda shrimp and saline finfish. Polder sluice gates must be sealed tightly to protect inland soil.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 3-STEP QUICKSTART */}
          {activeTab === "quickstart" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Follow these three simple steps to get the most value out of HydroShift AI:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary font-bold font-mono text-sm flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Explore Real-Time Conditions on the Map</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Open the <strong>Map Explorer</strong> to view the entire Khulna delta, with river currents, polder embankments, and color-coded salinity fronts. Click any Upazila (Dacope, Koyra, Paikgachha) or river gauge to see instant readings.
                    </p>
                    <Link 
                      href="/app/map" 
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-primary font-semibold text-xs mt-2 hover:underline"
                    >
                      Open Map Explorer <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Optimize Your Crop Rotation Plan</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Use the <strong>Crop Rotation DSS</strong> to select your coastal polder. Adjust your soil or canal salinity slider, and the AI automatically ranks the top 4 3-season crop sequences by net profit (in ৳ BDT) and water safety.
                    </p>
                    <Link 
                      href="/app/crop-rotation" 
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-xs mt-2 hover:underline"
                    >
                      Open Crop Rotation DSS <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold font-mono text-sm flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Simulate Storm Surges &amp; Climate Shocks</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">
                      Go to the <strong>Scenarios Studio</strong> to test "What-If" situations: e.g. a +1.5m cyclone storm surge or 50% Gorai river discharge drop. See how far inland the saltwater front pushes along the 82 km Passur estuary.
                    </p>
                    <Link 
                      href="/app/scenarios" 
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 text-purple-400 font-semibold text-xs mt-2 hover:underline"
                    >
                      Open Scenarios Studio <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SIMPLE GLOSSARY */}
          {activeTab === "glossary" && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-cyan-300 block mb-0.5">NASA SWOT Satellite</span>
                <p className="text-muted-foreground">
                  Surface Water and Ocean Topography satellite launched by NASA &amp; CNES. It carries a radar interferometer that measures river water surface height (WSE) and river width from orbit with centimetric precision.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-emerald-300 block mb-0.5">Coastal Polder (পোল্ডার)</span>
                <p className="text-muted-foreground">
                  An enclosed tract of low-lying agricultural land surrounded by an earthen flood embankment (dyke). Sluice gates in the dyke open at low tide to drain water and close at high tide to keep out saltwater.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-amber-300 block mb-0.5">Boro vs. Aman Rice Seasons</span>
                <p className="text-muted-foreground">
                  <strong>T. Aman</strong> is grown during the monsoon rainy season (July–November) when rainfall naturally washes away salt. <strong>Boro</strong> is grown in the dry winter/spring (December–May) when rivers drop and ocean salinity surges inland.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-purple-300 block mb-0.5">WSE (Water Surface Elevation)</span>
                <p className="text-muted-foreground">
                  The actual height of river water above the national Public Works Datum (PWD) baseline. When the river WSE is higher than the canal water inside a polder, gravity intake is possible; when river WSE is lower, drainage is possible.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <span className="font-bold text-sky-300 block mb-0.5">PINN (Physics-Informed Neural Network)</span>
                <p className="text-muted-foreground">
                  An advanced AI model that is taught the laws of physics (fluid mechanics and salt dispersion) so it cannot produce unrealistic predictions, even when ground sensor data is sparse.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: FARMER & COMMUNITY ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">Key Actionable Rules for Farmers:</h4>
                <ul className="space-y-2 list-disc list-inside text-muted-foreground text-xs">
                  <li><strong className="text-white">Store Early Winter Freshwater:</strong> Keep polder sluice gates open during November to fill internal canals before river salinity exceeds 3.5 dS/m.</li>
                  <li><strong className="text-white">Apply Rice Straw Mulch:</strong> Covering soil with straw after harvest stops sun evaporation, preventing salt from rising to the surface through capillary suction.</li>
                  <li><strong className="text-white">Plant Short-Duration Aman:</strong> Plant varieties like BRRI dhan75 that harvest by October, leaving soil moist and ready for winter mustard or sunflower.</li>
                  <li><strong className="text-white">Do Not Irrigate with &gt;4 dS/m Water:</strong> If canal water exceeds 4.0 dS/m during rice flowering, do not irrigate—it causes empty rice grains (চিটা).</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
                <span className="font-bold text-white block mb-1">Official Extension &amp; Advisory Agencies:</span>
                <p className="text-muted-foreground">
                  Soil Resource Development Institute (SRDI) Khulna • Bangladesh Rice Research Institute (BRRI) Satkhira • Bangladesh Water Development Board (BWDB) Division-1.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">ESC</kbd> or click Close to return.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-primary text-black font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickGuideModal;
