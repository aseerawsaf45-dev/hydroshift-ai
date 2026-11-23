"use client";

import React, { useState } from "react";
import { Sprout, Calendar, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Droplets, Info } from "lucide-react";

interface RotationPattern {
  id: string;
  title: string;
  titleBn: string;
  status: "RECOMMENDED" | "FEASIBLE" | "HIGH_RISK";
  netProfit: number;
  waterM3: number;
  croppingIntensity: number;
  seasons: {
    name: string;
    crop: string;
    months: string;
    startMonthIdx: number; // 0 = Nov
    durationMonths: number;
    saltRisk: "Low" | "Medium" | "High";
    yieldTon: number;
  }[];
  explanation: string;
  explanationBn: string;
}

const MONTHS_DATA = [
  { name: "Nov", ec: 3.2, risk: "Low" },
  { name: "Dec", ec: 4.8, risk: "Low" },
  { name: "Jan", ec: 6.5, risk: "Medium" },
  { name: "Feb", ec: 8.9, risk: "Medium" },
  { name: "Mar", ec: 12.8, risk: "High" },
  { name: "Apr", ec: 15.6, risk: "High" },
  { name: "May", ec: 11.4, risk: "High" },
  { name: "Jun", ec: 4.5, risk: "Low" },
  { name: "Jul", ec: 2.1, risk: "Low" },
  { name: "Aug", ec: 1.6, risk: "Low" },
  { name: "Sep", ec: 1.8, risk: "Low" },
  { name: "Oct", ec: 2.4, risk: "Low" },
];

const ROTATIONS: RotationPattern[] = [
  {
    id: "rot-triple-crop",
    title: "1. Climate-Resilient Triple Crop: Sunflower → Mungbean → T. Aman",
    titleBn: "১. জলবায়ু-সহনশীল তিন-ফসল: সূর্যমুখী → মুগডাল → আমন ধান",
    status: "RECOMMENDED",
    netProfit: 118000,
    waterM3: 13500,
    croppingIntensity: 285,
    seasons: [
      { name: "Rabi (Winter)", crop: "Sunflower BARI-2", months: "Nov – Feb", startMonthIdx: 0, durationMonths: 3.5, saltRisk: "Low", yieldTon: 2.4 },
      { name: "Kharif-1 (Early Dry/Rain)", crop: "Mungbean BARI-6 (Straw Mulch)", months: "Feb – May", startMonthIdx: 3, durationMonths: 2.5, saltRisk: "Medium", yieldTon: 1.3 },
      { name: "Kharif-2 (Monsoon)", crop: "T. Aman (BRRI dhan73)", months: "Jul – Oct", startMonthIdx: 8, durationMonths: 4, saltRisk: "Low", yieldTon: 4.8 },
    ],
    explanation: "Harvests sunflower before the March salinity surge. Mungbean fixes nitrogen under rice-straw mulch. Utilizes monsoon rain for Aman without expensive river pumping.",
    explanationBn: "মার্চ মাসের তীব্র নোনা পানি আসার আগেই সূর্যমুখী কাটা শেষ হয়। খড়ের জাবড়া দিয়ে মুগডাল চাষ মাটির আর্দ্রতা ধরে রাখে এবং আমন ধান বর্ষার মিষ্টি পানিতে ফলন দেয়।",
  },
  {
    id: "rot-brri67",
    title: "2. Salt-Tolerant Rice + Monsoon Aman: BRRI dhan67 → Fallow → T. Aman",
    titleBn: "২. লবণ-সহনশীল ধান + আমন: ব্রি ধান৬৭ → পতিত → আমন ধান",
    status: "FEASIBLE",
    netProfit: 78000,
    waterM3: 19500,
    croppingIntensity: 190,
    seasons: [
      { name: "Rabi (Winter)", crop: "BRRI dhan67 (Salt Tolerant)", months: "Nov – Mar", startMonthIdx: 0, durationMonths: 4.5, saltRisk: "Medium", yieldTon: 5.4 },
      { name: "Kharif-1", crop: "Fallow / Soil Leaching", months: "Apr – Jun", startMonthIdx: 5, durationMonths: 2.5, saltRisk: "High", yieldTon: 0 },
      { name: "Kharif-2 (Monsoon)", crop: "T. Aman (BRRI dhan73)", months: "Jul – Oct", startMonthIdx: 8, durationMonths: 4, saltRisk: "Low", yieldTon: 5.2 },
    ],
    explanation: "BRRI dhan67 tolerates up to 8 dS/m during vegetative growth. Canals must be filled in November; intake locked shut after mid-February.",
    explanationBn: "ব্রি ধান৬৭ কুশি গজানোর সময় ৮ dS/m লবণ সহ্য করতে পারে। তবে চৈত্র মাসে নোনা পানি বন্ধ রাখতে খালের সঞ্চিত মিষ্টি পানি ব্যবহার করতে হয়।",
  },
  {
    id: "rot-traditional-mono",
    title: "3. High-Risk Traditional Monoculture: BR28 → Fallow → Local Aman",
    titleBn: "৩. উচ্চ ঝুঁকিপূর্ণ সনাতন বোরো: ব্রি ধান২৮ → পতিত → স্থানীয় আমন",
    status: "HIGH_RISK",
    netProfit: 35000,
    waterM3: 24000,
    croppingIntensity: 154,
    seasons: [
      { name: "Rabi (Winter)", crop: "Traditional Boro (BR28)", months: "Dec – Apr", startMonthIdx: 1, durationMonths: 5, saltRisk: "High", yieldTon: 1.2 },
      { name: "Kharif-1", crop: "Fallow (Salt-Crusted)", months: "Apr – Jun", startMonthIdx: 5, durationMonths: 2.5, saltRisk: "High", yieldTon: 0 },
      { name: "Kharif-2 (Monsoon)", crop: "Traditional Aman (BR11)", months: "Jul – Oct", startMonthIdx: 8, durationMonths: 4, saltRisk: "Low", yieldTon: 4.1 },
    ],
    explanation: "Traditional Boro flowers in late March when Passur River exceeds 12 dS/m. Causes complete floral sterility and heavy loss.",
    explanationBn: "মার্চ মাসের শেষে যখন গাছে ফুল আসে তখন নদীর লবণাক্ততা ১২ dS/m ছাড়িয়ে যায়। এতে শিষ সম্পূর্ণ চিটা হয়ে বিপুল অর্থনৈতিক ক্ষতি হয়।",
  },
];

export function CropRotationTimelineInfographic({ lang = "en" }: { lang?: "en" | "bn" }) {
  const [selectedRotationId, setSelectedRotationId] = useState<string>("rot-triple-crop");
  const selectedRotation = ROTATIONS.find((r) => r.id === selectedRotationId) || ROTATIONS[0];

  return (
    <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
      <div className="bezel-core p-5 sm:p-6 rounded-[20px] bg-[#071322] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Seasonal Strategy Infographic
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Calendar className="w-4 h-4 text-primary" />
              <span>
                {lang === "en"
                  ? "Annual Salinity Curve vs. 3-Season Crop Timelines"
                  : "বার্ষিক লবণাক্ততার গতিধারা বনাম তিন-মৌসুমী ফসল পর্যায়ক্রম"}
              </span>
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground uppercase px-2.5 py-1 rounded-full bg-white/5 border border-white/10 self-start sm:self-auto">
            Dacope Polders 31 &amp; 32 Benchmark
          </span>
        </div>

        {/* 1. Monthly Salinity Curve Diagram */}
        <div className="p-4 rounded-2xl bg-[#030912] border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Passur River Salinity Trajectory (Monthly dS/m)</span>
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-emerald-400">● &lt;5 Safe</span>
              <span className="text-amber-400">● 5–10 Moderate</span>
              <span className="text-rose-400">● &gt;10 Severe Peak</span>
            </div>
          </div>

          {/* Graphical Height Histogram */}
          <div className="grid grid-cols-12 gap-1.5 items-end h-28 pt-2">
            {MONTHS_DATA.map((m, idx) => {
              const heightPct = Math.round((m.ec / 16.0) * 100);
              const isPeak = m.ec >= 10;
              const isMod = m.ec >= 5 && m.ec < 10;

              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className={`text-[10px] font-mono font-bold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity ${
                    isPeak ? "text-rose-400" : isMod ? "text-amber-400" : "text-emerald-400"
                  }`}>
                    {m.ec}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 relative overflow-hidden ${
                      isPeak
                        ? "bg-gradient-to-t from-rose-900 to-rose-500 shadow-lg shadow-rose-950/60"
                        : isMod
                        ? "bg-gradient-to-t from-amber-900 to-amber-500"
                        : "bg-gradient-to-t from-emerald-950 to-emerald-500"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">{m.name}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground pt-1 border-t border-white/5">
            <span>Nov: Sweet River Flushing</span>
            <span className="text-rose-400 font-bold">Mar–Apr: Extreme Seawater Ingress</span>
            <span>Jul–Oct: Monsoon Rain Wash</span>
          </div>
        </div>

        {/* 2. Interactive Rotation Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ROTATIONS.map((r) => {
            const isSelected = r.id === selectedRotationId;
            const isRec = r.status === "RECOMMENDED";
            const isDanger = r.status === "HIGH_RISK";

            return (
              <button
                key={r.id}
                onClick={() => setSelectedRotationId(r.id)}
                className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                  isSelected
                    ? isRec
                      ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-950/50 scale-[1.01]"
                      : isDanger
                      ? "bg-rose-500/15 border-rose-500/50 shadow-lg shadow-rose-950/50 scale-[1.01]"
                      : "bg-sky-500/15 border-sky-500/50 shadow-lg shadow-sky-950/50 scale-[1.01]"
                    : "bg-white/[0.02] border-white/10 hover:bg-white/5 text-muted-foreground"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                      isRec
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : isDanger
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                        : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                    }`}>
                      {isRec ? "Recommended" : isDanger ? "High Risk" : "Feasible"}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      ৳ {r.netProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white leading-tight">
                    {lang === "en" ? r.title : r.titleBn}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span>Intensity: {r.croppingIntensity}%</span>
                  <span>Water: {r.waterM3.toLocaleString()} m³</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Detailed Visual Rotation Timeline */}
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
            <span className="font-bold text-white">
              {lang === "en" ? selectedRotation.title : selectedRotation.titleBn}
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-emerald-400 font-bold">
                Profit: ৳{selectedRotation.netProfit.toLocaleString()}/ha
              </span>
              <span className="text-muted-foreground">
                Water: {selectedRotation.waterM3.toLocaleString()} m³
              </span>
            </div>
          </div>

          {/* 3 Season Visual Timeline Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {selectedRotation.seasons.map((s, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  s.saltRisk === "High"
                    ? "bg-rose-500/10 border-rose-500/30"
                    : s.saltRisk === "Medium"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-emerald-500/10 border-emerald-500/30"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-white font-bold uppercase">{s.name}</span>
                  <span className={`px-2 py-0.2 rounded-full font-bold ${
                    s.saltRisk === "High" ? "bg-rose-500/20 text-rose-300" : s.saltRisk === "Medium" ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}>
                    {s.saltRisk} Salt Risk
                  </span>
                </div>
                <div className="font-bold text-xs text-white">{s.crop}</div>
                <div className="text-[11px] text-muted-foreground font-mono">{s.months}</div>
                <div className="text-[10px] text-emerald-400 font-mono pt-1">
                  {s.yieldTon > 0 ? `Est. Yield: ${s.yieldTon} ton/ha` : "Fallow (পতিত জমি)"}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
            <strong className="text-white">{lang === "en" ? "Agronomic Rationale: " : "যৌক্তিক ব্যাখ্যা: "}</strong>
            {lang === "en" ? selectedRotation.explanation : selectedRotation.explanationBn}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CropRotationTimelineInfographic;
