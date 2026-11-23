"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  Sprout,
  Activity,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface WaterSourceData {
  id: string;
  name: string;
  nameBn: string;
  village: string;
  villageBn: string;
  polder: string;
  sourceType: "Canal" | "Pond / Khari" | "Sluice Outfall" | "River Inflow";
  sourceTypeBn: string;
  coordinates: { lat: number; lon: number };
  ec25: number; // dS/m at 25C
  tds: number; // mg/L
  cClass: "C1" | "C2" | "C3" | "C4";
  provenance: "VERIFIED_MEASURED" | "ESTIMATED_FORECAST" | "DEMO_DATA";
  lastSampleTime: string;
  verifiedBy: string;
  meterCheckPassed: boolean;
  forecastTrend: "RISING" | "FALLING" | "STABLE";
  forecast7dRange: [number, number];
  potentialCClasses: string[];
  intendedUses: {
    use: string;
    useBn: string;
    stage: string;
    status: "SUITABLE" | "CAUTION" | "UNSUITABLE";
    guidance: string;
    guidanceBn: string;
  }[];
  reviewedAction: {
    instruction: string;
    instructionBn: string;
    validityHours: number;
    nextCheckTime: string;
    reviewer: string;
    status: "APPROVED" | "PENDING_REVIEW";
  };
  safeAlternative: {
    name: string;
    type: string;
    ec25: number;
    distanceMeters: number;
    accessPermission: string;
  };
}

const PILOT_SOURCES: WaterSourceData[] = [
  {
    id: "dacope-bajua-canal",
    name: "Bajua Main Irrigation Canal",
    nameBn: "বাজুয়া প্রধান সেচ খাল",
    village: "Bajua (বাজুয়া)",
    villageBn: "বাজুয়া",
    polder: "Polder 31",
    sourceType: "Canal",
    sourceTypeBn: "অভ্যন্তরীণ নিষ্কাশন খাল",
    coordinates: { lat: 22.572, lon: 89.512 },
    ec25: 1.8,
    tds: 1152,
    cClass: "C3",
    provenance: "VERIFIED_MEASURED",
    lastSampleTime: "Today at 08:30 AM (2 hours ago)",
    verifiedBy: "M. Rahman (Dacope Community Water Facilitator)",
    meterCheckPassed: true,
    forecastTrend: "RISING",
    forecast7dRange: [1.7, 2.6],
    potentialCClasses: ["C3"],
    intendedUses: [
      {
        use: "Sunflower (সূর্যমুখী)",
        useBn: "সূর্যমুখী",
        stage: "Seedbed & Early Vegetative",
        status: "SUITABLE",
        guidance: "Safe for BARI Surjamukhi-2 seedling irrigation. Threshold is 4.8 dS/m.",
        guidanceBn: "বারি সূর্যমুখী-২ চারা সেচের জন্য নিরাপদ। লবণের সহনশীলতা সীমা ৪.৮ dS/m।",
      },
      {
        use: "Boro Rice (বোরো ধান)",
        useBn: "বোরো ধান",
        stage: "Seedling Nursery (বীজতলা)",
        status: "CAUTION",
        guidance: "Use with caution. Safe for salt-tolerant BRRI dhan67; avoid for traditional BR28/29.",
        guidanceBn: "সতর্কতা প্রয়োজন। লবণ-সহনশীল ব্রি ধান৬৭-এর জন্য ব্যবহারযোগ্য; বিআর২৮/২৯-এ ক্ষতি হতে পারে।",
      },
      {
        use: "Mungbean (মুগডাল)",
        useBn: "মুগডাল",
        stage: "Germination & Emergence",
        status: "SUITABLE",
        guidance: "Suitable under rice-straw mulch. Do not flood furrow excessively.",
        guidanceBn: "খড়ের মালচিংয়ের নিচে সেচের উপযোগী। অতিরিক্ত পানি জমিয়ে রাখবেন না।",
      },
    ],
    reviewedAction: {
      instruction: "Irrigate seedbeds within the next 36 hours. Close inlet flap-gate before Friday spring tide.",
      instructionBn: "আগামী ৩৬ ঘণ্টার মধ্যে বীজতলায় সেচ দিন। শুক্রবারের অমাবস্যার জোয়ারের আগে খালের মুখ বন্ধ করুন।",
      validityHours: 36,
      nextCheckTime: "Tomorrow, 08:00 AM",
      reviewer: "Upazila Agriculture Office (DAE Dacope)",
      status: "APPROVED",
    },
    safeAlternative: {
      name: "Pankhali Community Retention Pond",
      type: "Rainwater Pond",
      ec25: 0.85,
      distanceMeters: 450,
      accessPermission: "Verified Community Access",
    },
  },
  {
    id: "dacope-pankhali-khari",
    name: "Pankhali Freshwater Retention Khari",
    nameBn: "পানখালী মিষ্টি পানি সংরক্ষণ খাঁড়ি",
    village: "Pankhali (পানখালী)",
    villageBn: "পানখালী",
    polder: "Polder 31",
    sourceType: "Pond / Khari",
    sourceTypeBn: "সংরক্ষিত মিষ্টি পানির খাঁড়ি",
    coordinates: { lat: 22.585, lon: 89.525 },
    ec25: 0.95,
    tds: 608,
    cClass: "C2",
    provenance: "VERIFIED_MEASURED",
    lastSampleTime: "Today at 07:15 AM (3 hours ago)",
    verifiedBy: "M. Rahman (Dacope Community Water Facilitator)",
    meterCheckPassed: true,
    forecastTrend: "STABLE",
    forecast7dRange: [0.9, 1.2],
    potentialCClasses: ["C2"],
    intendedUses: [
      {
        use: "Boro Rice Seedbed (বোরো বীজতলা)",
        useBn: "বোরো বীজতলা",
        stage: "Transplanting & Nursery",
        status: "SUITABLE",
        guidance: "Excellent quality freshwater. Ideal for nursery raising and initial puddling.",
        guidanceBn: "চমৎকার মিষ্টি পানি। ধানের চারা তৈরি এবং জমি তৈরির জন্য অত্যন্ত উপযোগী।",
      },
      {
        use: "Winter Vegetables (রবি শাকসবজি)",
        useBn: "রবি শাকসবজি",
        stage: "All Growth Stages",
        status: "SUITABLE",
        guidance: "Low salinity. Fully safe for tomato, eggplant, and cabbage.",
        guidanceBn: "লবণাক্ততা কম। টমেটো, বেগুন ও বাঁধাকপির জন্য সম্পূর্ণ নিরাপদ।",
      },
    ],
    reviewedAction: {
      instruction: "Conserve stored water for nursery beds. Restrict pump drawdowns to preserve pond depth.",
      instructionBn: "বীজতলার জন্য পানি সংরক্ষণ করুন। পুকুরের গভীরতা বজায় রাখতে অতিরিক্ত পাম্পিং করবেন না।",
      validityHours: 72,
      nextCheckTime: "Wednesday, 09:00 AM",
      reviewer: "Polder 31 Water Management Group",
      status: "APPROVED",
    },
    safeAlternative: {
      name: "Bajua Canal North Branch",
      type: "Secondary Canal",
      ec25: 1.6,
      distanceMeters: 620,
      accessPermission: "Verified Community Access",
    },
  },
  {
    id: "dacope-kamarkhola-sluice",
    name: "Kamarkhola Sluice Outfall Canal",
    nameBn: "কামারখোলা স্লুইস নিষ্কাশন খাল",
    village: "Kamarkhola (কামারখোলা)",
    villageBn: "কামারখোলা",
    polder: "Polder 32",
    sourceType: "Sluice Outfall",
    sourceTypeBn: "স্লুইস গেট সংলগ্ন নদী চ্যানেল",
    coordinates: { lat: 22.495, lon: 89.488 },
    ec25: 4.8,
    tds: 3072,
    cClass: "C4",
    provenance: "VERIFIED_MEASURED",
    lastSampleTime: "Yesterday at 05:00 PM (17 hours ago)",
    verifiedBy: "S. Mondal (Polder 32 Sluice Inspector)",
    meterCheckPassed: true,
    forecastTrend: "RISING",
    forecast7dRange: [4.5, 6.8],
    potentialCClasses: ["C4"],
    intendedUses: [
      {
        use: "Rice Crops (সকল ধান ফসল)",
        useBn: "ধান ফসল",
        stage: "All Stages",
        status: "UNSUITABLE",
        guidance: "High salinity hazard! Will trigger immediate leaf scorch and seedling mortality.",
        guidanceBn: "মারাত্মক লবণাক্ততা! ধানের পাতা পুড়ে যাবে এবং চারা মরে যাওয়ার চরম ঝুঁকি রয়েছে।",
      },
      {
        use: "Sunflower / Mustard",
        useBn: "সূর্যমুখী / সরিষা",
        stage: "Late Flowering Only",
        status: "CAUTION",
        guidance: "Emergency use only on mature plants. Avoid applying to seedbeds.",
        guidanceBn: "শুধুমাত্র পরিপক্ব ফসলে জরুরি প্রয়োজনে। কোনোভাবেই বীজতলায় ব্যবহার করবেন না।",
      },
    ],
    reviewedAction: {
      instruction: "DO NOT IRRIGATE. Flap gates must remain latched shut to prevent saline backflow.",
      instructionBn: "সেচ দিবেন না। খালের মুখে নোনা পানি প্রবেশ ঠেকাতে স্লুইস গেটের ফ্ল্যাপ লক রাখুন।",
      validityHours: 24,
      nextCheckTime: "Today at 04:00 PM",
      reviewer: "BWDB Field Sub-Division (Khulna-2)",
      status: "APPROVED",
    },
    safeAlternative: {
      name: "Sutarkhali High School Pond",
      type: "Community Pond",
      ec25: 1.1,
      distanceMeters: 850,
      accessPermission: "Check with School Committee",
    },
  },
  {
    id: "dacope-sutarkhali-inflow",
    name: "Sutarkhali River Outfall Point",
    nameBn: "সুতারখালী নদী আউটফল পয়েন্ট",
    village: "Sutarkhali (সুতারখালী)",
    villageBn: "সুতারখালী",
    polder: "Polder 32",
    sourceType: "River Inflow",
    sourceTypeBn: "নদী সংযোগ পয়েন্ট",
    coordinates: { lat: 22.478, lon: 89.465 },
    ec25: 6.2,
    tds: 3968,
    cClass: "C4",
    provenance: "VERIFIED_MEASURED",
    lastSampleTime: "Yesterday at 04:30 PM",
    verifiedBy: "S. Mondal (Polder 32 Sluice Inspector)",
    meterCheckPassed: true,
    forecastTrend: "RISING",
    forecast7dRange: [5.8, 8.5],
    potentialCClasses: ["C4"],
    intendedUses: [
      {
        use: "Freshwater Agriculture",
        useBn: "মিষ্টি পানির কৃষি",
        stage: "All crops",
        status: "UNSUITABLE",
        guidance: "Severe saline water. Unsuitable for all agricultural crops. Sluice gate locked.",
        guidanceBn: "তীব্র নোনা পানি। সকল ফসলের জন্য সম্পূর্ণ অনুপযোগী। স্লুইস গেট বন্ধ রাখুন।",
      },
    ],
    reviewedAction: {
      instruction: "Intake gate sealed. Awaiting low-salinity ebb tide flush before sample re-check.",
      instructionBn: "গেট সিল করা। আগামী ভাটায় মিষ্টি পানি ফ্লাশ না হওয়া পর্যন্ত সেচ বন্ধ রাখুন।",
      validityHours: 24,
      nextCheckTime: "Tomorrow at 10:00 AM",
      reviewer: "Dacope Disaster Management Committee",
      status: "APPROVED",
    },
    safeAlternative: {
      name: "Dacope Union Council Reserve Tank",
      type: "Rainwater Harvester",
      ec25: 0.4,
      distanceMeters: 1200,
      accessPermission: "Verified Community Access",
    },
  },
];

export default function MyWaterPage() {
  const [selectedSourceId, setSelectedSourceId] = useState<string>("dacope-bajua-canal");
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [viewMode, setViewMode] = useState<"card" | "map">("card");

  const source = PILOT_SOURCES.find((s) => s.id === selectedSourceId) || PILOT_SOURCES[0];

  const getCClassBadge = (cClass: "C1" | "C2" | "C3" | "C4") => {
    switch (cClass) {
      case "C1":
        return {
          label: "C1 - Low Salinity (< 0.75 dS/m)",
          labelBn: "C1 - মিষ্টি পানি (০.৭৫ dS/m এর নিচে)",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
          desc: "Excellent freshwater. Safe for all crops.",
          descBn: "উত্তম মিষ্টি পানি। সকল ফসলের জন্য সম্পূর্ণ নিরাপদ।",
        };
      case "C2":
        return {
          label: "C2 - Medium Salinity (0.75 - 1.5 dS/m)",
          labelBn: "C2 - সহনীয় পানি (০.৭৫ - ১.৫ dS/m)",
          color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
          desc: "Good quality. Suitable for most crops; slight caution on young rice nurseries.",
          descBn: "ভালো মান। অধিকাংশ ফসলে ব্যবহারযোগ্য; বীজতলায় কিছুটা সতর্কতা দরকার।",
        };
      case "C3":
        return {
          label: "C3 - High Salinity (1.5 - 3.0 dS/m)",
          labelBn: "C3 - মধ্যম নোনা পানি (১.৫ - ৩.০ dS/m)",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
          desc: "Moderate salinity. Safe for salt-tolerant varieties (BRRI 67, Sunflower); risky for traditional Boro.",
          descBn: "লবণাক্ততা বেশি। শুধুমাত্র লবণ-সহনশীল ফসলে (ব্রি ৬৭, সূর্যমুখী) ব্যবহারযোগ্য।",
        };
      case "C4":
        return {
          label: "C4 - Very High Salinity (> 3.0 dS/m)",
          labelBn: "C4 - তীব্র নোনা পানি (৩.০ dS/m এর বেশি)",
          color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
          desc: "Severe salinity hazard. Unsuitable for freshwater irrigation. Sluice gates must be locked.",
          descBn: "চরম নোনা পানি। ফসলে সেচ দেওয়া নিষেধ। গেট বন্ধ রাখতে হবে।",
        };
    }
  };

  const cBadge = getCClassBadge(source.cClass);

  return (
    <div className="min-h-[100dvh] bg-[#05070d] text-foreground p-3 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HEADER & PILOT SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="outline" className="text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Dacope Pilot Community // দাকোপ পাইলট
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Polders 31 & 32</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Droplets className="w-7 h-7 text-primary" />
            <span>{lang === "en" ? "My Water: Local Salinity & Decisions" : "আমার পানি: স্থানীয় লবণাক্ততা ও সিদ্ধান্ত"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {lang === "en"
              ? "Verified field measurements and short-term salinity guidance for irrigation and sowing in Dacope."
              : "দাকোপের কৃষকদের জন্য যাচাইকৃত মাঠ পর্যায়ের পানির লবণাক্ততা এবং সেচ ও বপনের সময়োপযোগী সিদ্ধান্ত।"}
          </p>
        </div>

        {/* Language & View Switchers */}
        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                lang === "en" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                lang === "bn" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
              }`}
            >
              বাংলা
            </button>
          </div>

          <Link
            href="/app/crop-planning"
            className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>{lang === "en" ? "Crop Planning" : "ফসল পরিকল্পনা"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. VILLAGE & WATER SOURCE SELECTOR BAR */}
      <Card className="p-4 bg-[#0a121e]/80 border-white/10 backdrop-blur-xl rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="font-semibold text-white">
              {lang === "en" ? "Select Local Water Source:" : "স্থানীয় পানির উৎস নির্বাচন করুন:"}
            </span>
          </div>

          {/* Quick Source Radio Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {PILOT_SOURCES.map((s) => {
              const isSelected = s.id === selectedSourceId;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSourceId(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left flex items-center gap-2 border ${
                    isSelected
                      ? "bg-primary text-black font-bold border-primary shadow-lg shadow-primary/25"
                      : "bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 border-white/10"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-black" : "bg-primary"}`} />
                  <span>{lang === "en" ? s.name : s.nameBn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? "bg-black/20 text-black font-bold" : "bg-black/40 text-muted-foreground"
                    }`}
                  >
                    {s.cClass}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 3. CORE WATER STATUS & ACTION HERO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current Reading & Salinity Class (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Reading Card */}
          <Card className="p-5 sm:p-6 bg-[#081320] border-white/15 rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {lang === "en" ? "Selected Source" : "নির্বাচিত উৎস"} • {source.polder}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {lang === "en" ? source.name : source.nameBn}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {lang === "en" ? source.village : source.villageBn} • {lang === "en" ? source.sourceType : source.sourceTypeBn}
                </span>
              </div>

              {/* Provenance Badge */}
              <div className="flex flex-col items-end">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? "Verified Field Reading" : "মাঠে যাচাইকৃত মান"}</span>
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {source.lastSampleTime}
                </span>
              </div>
            </div>

            {/* Salinity Gauge Metric */}
            <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {lang === "en" ? "Electrical Conductivity (EC @ 25°C)" : "তড়িৎ পরিবাহিতা (EC ২৫° সেলসিয়াসে)"}
                </span>
                <div className="flex items-baseline gap-2 mt-1 justify-center sm:justify-start">
                  <span className="text-5xl sm:text-6xl font-black font-mono text-white tracking-tight">
                    {source.ec25.toFixed(1)}
                  </span>
                  <span className="text-lg font-bold text-primary font-mono">dS/m</span>
                  <span className="text-xs text-muted-foreground font-mono">({source.tds} mg/L TDS)</span>
                </div>
              </div>

              {/* Salinity Class Box */}
              <div className={`p-4 rounded-2xl border text-center max-w-xs ${cBadge.color}`}>
                <span className="text-xs font-mono font-bold tracking-widest uppercase">
                  {lang === "en" ? "Water Class" : "পানির শ্রেণি"}
                </span>
                <div className="text-3xl font-black font-mono my-0.5">{source.cClass}</div>
                <p className="text-[11px] font-medium leading-snug">
                  {lang === "en" ? cBadge.desc : cBadge.descBn}
                </p>
              </div>
            </div>

            {/* Short-Term 7-14 Day Forecast Strip */}
            <div className="pt-4 border-t border-white/10 bg-white/[0.02] -mx-5 -mb-5 p-4 sm:p-5 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-white">
                    {lang === "en" ? "7–14 Day Forecast Window" : "৭–১৪ দিনের পূর্বাভাস ও প্রবণতা"}
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-muted-foreground">
                    {source.forecastTrend === "RISING"
                      ? lang === "en" ? "Rising Tide Trend" : "লবণাক্ততা বৃদ্ধি প্রবণতা"
                      : lang === "en" ? "Stable Tide" : "স্থিতিশীল"}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {lang === "en" ? "Expected Range:" : "প্রত্যাশিত সীমা:"} {source.forecast7dRange[0]} – {source.forecast7dRange[1]} dS/m
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {lang === "en"
                  ? `External Passur River tides are approaching spring cycle. Water in ${source.name} is expected to fluctuate between ${source.forecast7dRange[0]} and ${source.forecast7dRange[1]} dS/m (${source.potentialCClasses.join(", ")} class). Plan sowing before the weekend surge.`
                  : `পশুর নদীর অমাবস্যার জোয়ার আসন্ন। আগামী সপ্তাহে খালের লবণাক্ততা ${source.forecast7dRange[0]} থেকে ${source.forecast7dRange[1]} dS/m এর মধ্যে থাকতে পারে। সপ্তাহান্তের জোয়ারের আগেই বীজ বপন ও সেচ শেষ করুন।`}
              </p>
            </div>
          </Card>

          {/* Intended Use & Crop Stage Interpretation */}
          <Card className="p-5 bg-[#081320] border-white/15 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-white">
                  {lang === "en" ? "What Does This Water Mean For Your Crop?" : "আপনার ফসলের জন্য এই পানির অর্থ কী?"}
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                {lang === "en" ? "Reviewed Crop Stage Rules" : "যাচাইকৃত ফসলের নিয়মাবলী"}
              </span>
            </div>

            <div className="space-y-3">
              {source.intendedUses.map((u, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/15 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">
                        {lang === "en" ? u.use : u.useBn}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono">({u.stage})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lang === "en" ? u.guidance : u.guidanceBn}
                    </p>
                  </div>

                  <span
                    className={`self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shrink-0 border ${
                      u.status === "SUITABLE"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : u.status === "CAUTION"
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {u.status === "SUITABLE"
                      ? lang === "en" ? "Suitable" : "উপযোগী"
                      : u.status === "CAUTION"
                      ? lang === "en" ? "Caution" : "সতর্কতা"
                      : lang === "en" ? "Unsuitable" : "অনুপযোগী"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Reviewed Action Card, Local Contacts & Safe Alternatives (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Card */}
          <Card className="p-5 sm:p-6 bg-gradient-to-br from-[#0c1a2d] to-[#081320] border-primary/30 rounded-2xl shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase font-mono tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                {lang === "en" ? "Reviewed Action Card" : "অনুমোদিত পদক্ষেপ নির্দেশনা"}
              </span>
              <Badge className="bg-primary/20 text-primary border-primary/40 text-[10px]">
                {source.reviewedAction.status === "APPROVED"
                  ? lang === "en" ? "Locally Approved" : "স্থানীয়ভাবে অনুমোদিত"
                  : "Pending"}
              </Badge>
            </div>

            <div className="my-4 space-y-3">
              <h4 className="text-base font-bold text-white leading-snug">
                {lang === "en" ? source.reviewedAction.instruction : source.reviewedAction.instructionBn}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-muted-foreground block">
                    {lang === "en" ? "Window Validity" : "কার্যকারিতার মেয়াদ"}
                  </span>
                  <span className="font-bold text-white font-mono mt-0.5 block">
                    {source.reviewedAction.validityHours} Hours
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-muted-foreground block">
                    {lang === "en" ? "Next Scheduled Check" : "পরবর্তী মাপার সময়"}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono mt-0.5 block">
                    {source.reviewedAction.nextCheckTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>{lang === "en" ? "Sign-off Authority:" : "অনুমোদনকারী:"}</span>
              <span className="font-semibold text-white">{source.reviewedAction.reviewer}</span>
            </div>
          </Card>

          {/* Safe Alternative Water Source */}
          <Card className="p-5 bg-[#081320] border-white/15 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{lang === "en" ? "Nearby Safe Alternative Source" : "নিকটবর্তী বিকল্প নিরাপদ উৎস"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{source.safeAlternative.name}</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {source.safeAlternative.ec25} dS/m (C2)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{source.safeAlternative.type} • {source.safeAlternative.distanceMeters}m away</span>
                <span className="text-[11px] text-emerald-300 font-medium">{source.safeAlternative.accessPermission}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {lang === "en"
                ? "Note: Permissions have been verified by the community committee. Only use alternatives for seedbeds or emergency seedling rescue."
                : "নির্দেশনা: স্থানীয় কমিটির সাথে কথা বলে নিশ্চিত করা হয়েছে। শুধুমাত্র বীজতলা বা জরুরি প্রয়োজনে এই পানি ব্যবহার করুন।"}
            </p>
          </Card>

          {/* Local Facilitator & Help Contacts */}
          <Card className="p-5 bg-[#081320] border-white/15 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Phone className="w-4 h-4 text-primary" />
              <span>{lang === "en" ? "Local Support & Facilitator" : "স্থানীয় সাহায্য ও ফ্যাসিলিটেটর"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">M. Rahman (রহমান)</div>
                  <div className="text-[11px] text-muted-foreground">
                    {lang === "en" ? "Dacope Community Water Facilitator" : "দাকোপ কমিউনিটি পানি ফ্যাসিলিটেটর"}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                  Dacope SAAO Liaison
                </Badge>
              </div>
              <div className="text-xs text-primary font-mono font-semibold pt-1">
                Hotline / WhatsApp: +880 1712-345678
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Link
                href="/app/help"
                className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{lang === "en" ? "Dispute a reading or report issue" : "রিডিংয়ে ভুল থাকলে রিপোর্ট করুন"}</span>
              </Link>

              <Link
                href="/app/facilitator"
                className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{lang === "en" ? "Facilitator Sign-in" : "ফ্যাসিলিটেটর লগইন"}</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
