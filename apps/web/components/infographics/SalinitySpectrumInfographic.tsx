"use client";

import React, { useState } from "react";
import { Droplets, Sprout, AlertTriangle, ShieldCheck, ShieldAlert, CheckCircle2, Info } from "lucide-react";

interface SalinityTier {
  id: string;
  name: string;
  nameBn: string;
  ecRange: string;
  ecMin: number;
  ecMax: number;
  soilEcMultiplier: string;
  color: string;
  bgGrad: string;
  borderColor: string;
  textColor: string;
  crops: { name: string; nameBn: string; safe: boolean }[];
  impactDescription: string;
  impactDescriptionBn: string;
  farmerAction: string;
  farmerActionBn: string;
}

const SALINITY_TIERS: SalinityTier[] = [
  {
    id: "c1",
    name: "C1: Low Salinity",
    nameBn: "সি-১: মিষ্টি পানি",
    ecRange: "< 0.75 dS/m",
    ecMin: 0,
    ecMax: 0.75,
    soilEcMultiplier: "Soil ECe: < 1.1 dS/m",
    color: "#10b981",
    bgGrad: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-500/40",
    textColor: "text-emerald-400",
    crops: [
      { name: "Vegetables (Tomato, Brinjal)", nameBn: "শাকসবজি (টমেটো, বেগুন)", safe: true },
      { name: "Young Seedlings / Nurseries", nameBn: "ধানের কচি বীজতলা", safe: true },
      { name: "Traditional Boro Rice (BR28/29)", nameBn: "সাধারণ বোরো ধান", safe: true },
    ],
    impactDescription: "Optimal osmotic balance. Roots absorb water freely with zero cellular salt stress.",
    impactDescriptionBn: "অনুকূল অবস্থা। শিকড় কোনো বাধা ছাড়াই স্বাভাবিকভাবে পানি ও পুষ্টি শোষণ করতে পারে।",
    farmerAction: "Completely safe for seedbeds, nursery watering, and direct furrow irrigation.",
    farmerActionBn: "বীজতলা, সবজি ও যেকোনো ফসলের সেচের জন্য সম্পূর্ণ নিরাপদ।",
  },
  {
    id: "c2",
    name: "C2: Medium Salinity",
    nameBn: "সি-২: সহনীয় পানি",
    ecRange: "0.75 – 1.5 dS/m",
    ecMin: 0.75,
    ecMax: 1.5,
    soilEcMultiplier: "Soil ECe: 1.1 – 2.3 dS/m",
    color: "#06b6d4",
    bgGrad: "from-sky-500/20 via-sky-500/5 to-transparent",
    borderColor: "border-sky-500/40",
    textColor: "text-sky-400",
    crops: [
      { name: "Mustard (BARI Sarisha-14)", nameBn: "সরিষা (বারি সরিষা-১৪)", safe: true },
      { name: "Mungbean (BARI Mung-6)", nameBn: "মুগডাল (বারি মুগ-৬)", safe: true },
      { name: "Maize (ভুট্টা)", nameBn: "ভুট্টা", safe: true },
      { name: "Traditional Rice Nursery", nameBn: "সাধারণ ধানের বীজতলা", safe: false },
    ],
    impactDescription: "Mild osmotic tension. Tolerant field crops flourish; sensitive vegetable seedbeds require caution.",
    impactDescriptionBn: "হালকা চাপ। সহনশীল রবি ফসল অনায়াসে জন্মায়; তবে কচি বীজতলায় কিছুটা সতর্ক থাকতে হয়।",
    farmerAction: "Ideal for early Rabi oilseeds & pulses under rice straw mulch.",
    farmerActionBn: "ধানের খড় বিছিয়ে সরিষা ও মুগডাল চাষের জন্য সবচেয়ে উপযুক্ত।",
  },
  {
    id: "c3",
    name: "C3: High Salinity",
    nameBn: "সি-৩: মধ্যম নোনা পানি",
    ecRange: "1.5 – 3.0 dS/m",
    ecMin: 1.5,
    ecMax: 3.0,
    soilEcMultiplier: "Soil ECe: 2.3 – 4.5 dS/m",
    color: "#f59e0b",
    bgGrad: "from-amber-500/20 via-amber-500/5 to-transparent",
    borderColor: "border-amber-500/40",
    textColor: "text-amber-400",
    crops: [
      { name: "Sunflower (BARI Surjamukhi-2)", nameBn: "সূর্যমুখী (বারি সূর্যমুখী-২)", safe: true },
      { name: "Salt-Tolerant Boro (BRRI dhan67)", nameBn: "লবণ-সহনশীল ব্রি ধান৬৭", safe: true },
      { name: "Barley / Grass Pea (খেসারি)", nameBn: "খেসারি / বার্লি", safe: true },
      { name: "Traditional Boro (BR28)", nameBn: "প্রচলিত বোরো ধান", safe: false },
    ],
    impactDescription: "High root osmotic resistance. Traditional crops suffer stunted growth and spikelet sterility (চিটা).",
    impactDescriptionBn: "উচ্চ লবণাক্ততা চাপ। সাধারণ ধানে ব্যাপক চিটা হয় এবং ফলন ধসে পড়ে।",
    farmerAction: "Restricted use. Apply ONLY to proven salt-tolerant varieties like BRRI dhan67 or Sunflower.",
    farmerActionBn: "সীমিত ব্যবহার। শুধুমাত্র লবণ-সহনশীল ব্রি ধান৬৭ বা সূর্যমুখীতে ব্যবহার করুন।",
  },
  {
    id: "c4",
    name: "C4: Very High Salinity",
    nameBn: "সি-৪: তীব্র নোনা পানি",
    ecRange: "> 3.0 dS/m",
    ecMin: 3.0,
    ecMax: 6.0,
    soilEcMultiplier: "Soil ECe: > 4.5 dS/m",
    color: "#ef4444",
    bgGrad: "from-rose-500/20 via-rose-500/5 to-transparent",
    borderColor: "border-rose-500/40",
    textColor: "text-rose-400",
    crops: [
      { name: "All Freshwater Rice Varieties", nameBn: "সকল সাধারণ মিষ্টি পানির ধান", safe: false },
      { name: "Seedling Emergence", nameBn: "চারা গজানো", safe: false },
      { name: "Vegetables & Pulses", nameBn: "শাকসবজি ও ডাল", safe: false },
    ],
    impactDescription: "Severe plasmolysis and ion toxicity. Water draws OUT of plant roots into saline soil, killing crops.",
    impactDescriptionBn: "চরম বিষাক্ততা। মাটির লবণাক্ততা উদ্ভিদের শিকড় থেকে উল্টো পানি শুষে নিয়ে গাছ শুকিয়ে মারে।",
    farmerAction: "IRRIGATION FORBIDDEN. Close polder intake sluice gates. Seek alternate pond/rainwater.",
    farmerActionBn: "সেচ সম্পূর্ণ নিষিদ্ধ! স্লুইস গেট বন্ধ রাখুন। বিকল্প মিষ্টি পানির উৎস ব্যবহার করুন।",
  },
];

export function SalinitySpectrumInfographic({ lang = "en" }: { lang?: "en" | "bn" }) {
  const [selectedTierId, setSelectedTierId] = useState<string>("c2");
  const selectedTier = SALINITY_TIERS.find((t) => t.id === selectedTierId) || SALINITY_TIERS[1];

  return (
    <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
      <div className="bezel-core p-5 sm:p-6 rounded-[20px] bg-[#071322] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
                Classification Infographic
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Droplets className="w-4 h-4 text-primary" />
              <span>
                {lang === "en"
                  ? "Water Salinity Spectrum (C1 – C4) & Root-Zone Soil Impact"
                  : "পানির লবণাক্ততার বর্ণালী (সি১ – সি৪) ও মাটির প্রভাব নির্দেশিকা"}
              </span>
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 self-start sm:self-auto">
            FAO Irrigation & Salinity Standard
          </span>
        </div>

        {/* The 4-Tier Interactive Continuous Spectrum Bar */}
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl bg-black/50 border border-white/10">
            {SALINITY_TIERS.map((tier) => {
              const isSelected = tier.id === selectedTierId;
              return (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`p-3 rounded-xl text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? `bg-gradient-to-b ${tier.bgGrad} border ${tier.borderColor} shadow-lg scale-[1.02] z-10`
                      : "bg-white/[0.02] border border-transparent hover:bg-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono uppercase font-bold ${isSelected ? tier.textColor : "text-muted-foreground"}`}>
                      {tier.id.toUpperCase()}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-white leading-tight">
                      {lang === "en" ? tier.name.split(":")[1] : tier.nameBn.split(":")[1]}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 tabular-nums text-muted-foreground">
                      {tier.ecRange}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Continuous Gradient Bar Indicator */}
          <div className="w-full h-3 rounded-full bg-gradient-to-r from-emerald-500 via-sky-400 via-amber-400 to-rose-600 relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 to-transparent" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
            <span>0.0 dS/m (Fresh Rain)</span>
            <span>0.75 dS/m (C1 Limit)</span>
            <span>1.5 dS/m (C2 Limit)</span>
            <span>3.0 dS/m (C3 Limit)</span>
            <span>6.0+ dS/m (Estuarine Surge)</span>
          </div>
        </div>

        {/* Selected Tier Deep-Dive Card */}
        <div className={`bezel-shell p-1 rounded-2xl bg-gradient-to-br ${selectedTier.bgGrad} border ${selectedTier.borderColor} transition-all`}>
          <div className="bezel-core p-5 rounded-[14px] bg-[#081320] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div>
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${selectedTier.textColor}`}>
                  {lang === "en" ? selectedTier.name : selectedTier.nameBn} • {selectedTier.ecRange}
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  {lang === "en" ? selectedTier.impactDescription : selectedTier.impactDescriptionBn}
                </h4>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-right shrink-0">
                <span className="text-[10px] text-muted-foreground uppercase font-mono block">Root-Zone Salinity</span>
                <span className="text-xs font-bold font-mono text-white tabular-nums">{selectedTier.soilEcMultiplier}</span>
              </div>
            </div>

            {/* Crop Feasibility Grid */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold block mb-2">
                {lang === "en" ? "Tested Crop Response in this Water Class:" : "এই শ্রেণির পানিতে ফসলের সহনশীলতা:"}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedTier.crops.map((crop, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      crop.safe
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-200"
                        : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                    }`}
                  >
                    <span className="font-medium text-white">{lang === "en" ? crop.name : crop.nameBn}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      crop.safe ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                    }`}>
                      {crop.safe ? (lang === "en" ? "Feasible" : "উপযোগী") : (lang === "en" ? "Unsafe" : "ক্ষতিকর")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Directive */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2.5 text-xs">
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${selectedTier.textColor}`} />
              <div className="text-white">
                <strong className={selectedTier.textColor}>
                  {lang === "en" ? "Practical Action: " : "মাঠের করণীয়: "}
                </strong>
                <span>{lang === "en" ? selectedTier.farmerAction : selectedTier.farmerActionBn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Osmotic Capillary Root Note */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong className="text-white">{lang === "en" ? "Why EC Matters to Plants:" : "লবণাক্ততা কীভাবে ফসলের ক্ষতি করে: "}</strong>
            {lang === "en"
              ? "Plants drink water via osmotic pressure. When river or canal water contains high salt ions (>3 dS/m), the chemical potential of the soil water drops below the plant root's internal fluid, effectively causing drought even in a flooded field. This causes flowers to drop and rice spikelets to remain empty (chita)."
              : "উদ্ভিদ অসমোটিক চাপের মাধ্যমে শিকড় দিয়ে পানি শোষণ করে। পানিতে লবণের মাত্রা বেশি হলে শিকড় পানি গ্রহণ করতে পারে না, ফলে জমি পানিতে ডোবা থাকলেও ফসল তৃষ্ণায় মরে এবং ধানে চিটা হয়।"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SalinitySpectrumInfographic;
