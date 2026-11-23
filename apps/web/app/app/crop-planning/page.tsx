"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sprout,
  Calendar,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  DollarSign,
  Layers,
  ChevronRight,
  Activity,
  Sun,
  CloudRain,
  Flame,
} from "lucide-react";
import { CropRotationTimelineInfographic } from "@/components/infographics/CropRotationTimelineInfographic";
import { CapillaryMulchInfographic } from "@/components/infographics/CapillaryMulchInfographic";

// ---------------------------------------------------------------------------
// Crops & Varieties Data
// ---------------------------------------------------------------------------
interface CropVariety {
  id: string;
  name: string;
  nameBn: string;
  season: "Rabi" | "Kharif-1" | "Kharif-2";
  type: "Rice" | "Oilseed" | "Pulse" | "Vegetable";
  durationDays: number;
  waterNeedMm: number;
  saltThresholdEce: number; // dS/m threshold
  saltSlopeB: number; // % yield loss per dS/m above threshold
  optimalSowingWindow: string;
  criticalStageSalinitySensitive: string;
  seedbedAdvice: string;
}

const CROP_CATALOG: CropVariety[] = [
  {
    id: "sunflower-bari2",
    name: "Sunflower (BARI Surjamukhi-2)",
    nameBn: "সূর্যমুখী (বারি সূর্যমুখী-২)",
    season: "Rabi",
    type: "Oilseed",
    durationDays: 95,
    waterNeedMm: 260,
    saltThresholdEce: 4.8,
    saltSlopeB: 5.5,
    optimalSowingWindow: "Nov 15 – Dec 15",
    criticalStageSalinitySensitive: "Germination & Early Seedling",
    seedbedAdvice: "Tolerates moderate salinity once established; seedbed requires initial low-salt moisture.",
  },
  {
    id: "mungbean-bari6",
    name: "Mungbean (BARI Mung-6)",
    nameBn: "মুগডাল (বারি মুগ-৬)",
    season: "Kharif-1",
    type: "Pulse",
    durationDays: 65,
    waterNeedMm: 190,
    saltThresholdEce: 3.5,
    saltSlopeB: 9.5,
    optimalSowingWindow: "Feb 10 – Mar 05",
    criticalStageSalinitySensitive: "Germination & Pod Setting",
    seedbedAdvice: "Zero-tillage dibbling under rice straw mulch is mandatory to trap moisture and block salt crusts.",
  },
  {
    id: "rice-brri67",
    name: "Salt-Tolerant Boro (BRRI dhan67)",
    nameBn: "লবণ-সহনশীল বোরো ধান (ব্রি ধান৬৭)",
    season: "Rabi",
    type: "Rice",
    durationDays: 140,
    waterNeedMm: 850,
    saltThresholdEce: 8.0,
    saltSlopeB: 8.5,
    optimalSowingWindow: "Nov 20 – Dec 10",
    criticalStageSalinitySensitive: "Panicle Initiation & Flowering (Flowering threshold is lower: ~6.0 dS/m)",
    seedbedAdvice: "Nursery requires fresh pond/rain water (< 2 dS/m). Field transplanting can tolerate 8 dS/m.",
  },
  {
    id: "mustard-bari14",
    name: "Early Mustard (BARI Sarisha-14)",
    nameBn: "সরিষা (বারি সরিষা-১৪)",
    season: "Rabi",
    type: "Oilseed",
    durationDays: 80,
    waterNeedMm: 220,
    saltThresholdEce: 4.5,
    saltSlopeB: 6.0,
    optimalSowingWindow: "Nov 01 – Nov 20",
    criticalStageSalinitySensitive: "Seedling emergence",
    seedbedAdvice: "Fast maturity allows complete harvest by late January before March salinity peaks.",
  },
  {
    id: "rice-brri28",
    name: "Traditional Boro (BRRI dhan28) [High Risk]",
    nameBn: "প্রথাগত বোরো ধান (ব্রি ধান২৮) [উচ্চ ঝুঁকি]",
    season: "Rabi",
    type: "Rice",
    durationDays: 140,
    waterNeedMm: 1050,
    saltThresholdEce: 3.0,
    saltSlopeB: 12.0,
    optimalSowingWindow: "Nov 15 – Dec 05",
    criticalStageSalinitySensitive: "Entire reproductive stage (suffers 100% loss if ECe > 11.3 dS/m)",
    seedbedAdvice: "EXTREME CAUTION: In Dacope coastal zone, dry season river water frequently burns this variety.",
  },
];

// ---------------------------------------------------------------------------
// Candidate Seasonal Rotations
// ---------------------------------------------------------------------------
interface SeasonalRotation {
  id: string;
  title: string;
  titleBn: string;
  intensityPct: number;
  overallRating: "RECOMMENDED" | "FEASIBLE" | "HIGH_RISK";
  netProfitBdtPerHa: number;
  waterConsumptionM3: number;
  soilHealthAssessment: string;
  seasons: {
    name: string;
    crop: string;
    waterSource: string;
    expectedYieldTonHa: number;
    saltRisk: "Low" | "Medium" | "High";
  }[];
  calendarSluiceAdvice: string;
}

const CANDIDATE_ROTATIONS: SeasonalRotation[] = [
  {
    id: "rot-cash-crop",
    title: "Cash Crop Diversified: Sunflower/Mustard → Mungbean → Short Aman",
    titleBn: "বহুমুখী অর্থকরী ফসল: সূর্যমুখী/সরিষা → মুগডাল → স্বল্পমেয়াদী আমন",
    intensityPct: 300,
    overallRating: "RECOMMENDED",
    netProfitBdtPerHa: 245000,
    waterConsumptionM3: 9500,
    soilHealthAssessment: "Excellent. Mungbean fixes 40-50 kg atmospheric Nitrogen/ha. Straw mulch prevents salt crusts.",
    seasons: [
      {
        name: "Rabi (Nov – Feb)",
        crop: "BARI Surjamukhi-2 / Sarisha-14",
        waterSource: "Canal Stored Water (2 light furrow irrigations)",
        expectedYieldTonHa: 2.3,
        saltRisk: "Low",
      },
      {
        name: "Kharif-1 (Mar – Jun)",
        crop: "BARI Mung-6 (মুগডাল)",
        waterSource: "Residual Moisture under Rice Straw Mulch",
        expectedYieldTonHa: 1.45,
        saltRisk: "Low",
      },
      {
        name: "Kharif-2 (Jul – Oct)",
        crop: "High-Yielding Short T. Aman (BRRI dhan75)",
        waterSource: "Monsoon Rainfed",
        expectedYieldTonHa: 5.5,
        saltRisk: "Low",
      },
    ],
    calendarSluiceAdvice: "Lock flap gates in late Feb to hold freshwater; open low-tide gravity drainage in early June.",
  },
  {
    id: "rot-salt-rice",
    title: "Salt-Tolerant Rice: BRRI dhan67/97 → Sesame → Salt-Tolerant Aman",
    titleBn: "লবণ-সহনশীল ধান: ব্রি ধান৬৭/৯৭ → তিল → লবণ-সহনশীল আমন",
    intensityPct: 300,
    overallRating: "FEASIBLE",
    netProfitBdtPerHa: 218000,
    waterConsumptionM3: 15800,
    soilHealthAssessment: "Good. Sesame leaf litter restores organic matter, breaking continuous puddled rice hardpan.",
    seasons: [
      {
        name: "Rabi (Nov – Feb)",
        crop: "Salt-Tolerant Boro (BRRI dhan67)",
        waterSource: "Canal Storage + Alternate Wetting & Drying (AWD)",
        expectedYieldTonHa: 6.2,
        saltRisk: "Medium",
      },
      {
        name: "Kharif-1 (Mar – Jun)",
        crop: "Saline-Tolerant Sesame (BARI Til-4)",
        waterSource: "Residual Soil Moisture + 1 Supplemental Irrigation",
        expectedYieldTonHa: 1.15,
        saltRisk: "Medium",
      },
      {
        name: "Kharif-2 (Jul – Oct)",
        crop: "Salt-Tolerant T. Aman (BRRI dhan73)",
        waterSource: "Monsoon Rainfed",
        expectedYieldTonHa: 5.2,
        saltRisk: "Low",
      },
    ],
    calendarSluiceAdvice: "Fill internal ditches to capacity during Nov fresh river flushes; restrict intake after mid-February.",
  },
  {
    id: "rot-traditional-mono",
    title: "Traditional Monoculture: High-Risk Boro (BR28/29) → Fallow → BR11",
    titleBn: "প্রথাগত ঝুঁকিপূর্ণ বোরো: ব্রি ধান২৮/২৯ → পতিত → বিআর১১",
    intensityPct: 154,
    overallRating: "HIGH_RISK",
    netProfitBdtPerHa: 35000,
    waterConsumptionM3: 24000,
    soilHealthAssessment: "Degraded. Heavy pump drawdowns pull saline groundwater; topsoil crusted with salt in March-April.",
    seasons: [
      {
        name: "Rabi (Nov – Feb)",
        crop: "Traditional Boro (BRRI dhan28)",
        waterSource: "River Pumping (River EC climbs > 8 dS/m in March)",
        expectedYieldTonHa: 1.2, // severe yield crash
        saltRisk: "High",
      },
      {
        name: "Kharif-1 (Mar – Jun)",
        crop: "Fallow (জমি পতিত)",
        waterSource: "None (Soil dry and salt-crusted)",
        expectedYieldTonHa: 0.0,
        saltRisk: "High",
      },
      {
        name: "Kharif-2 (Jul – Oct)",
        crop: "Traditional T. Aman (BR11)",
        waterSource: "Monsoon Rainfed",
        expectedYieldTonHa: 4.1,
        saltRisk: "Low",
      },
    ],
    calendarSluiceAdvice: "Severe risk of saline water intake. Not recommended under current estuarine salinity forecasts.",
  },
];

export default function CropPlanningPage() {
  const [activeTab, setActiveTab] = useState<"sowing" | "season">("sowing");
  const [lang, setLang] = useState<"en" | "bn">("en");

  // Sowing view inputs
  const [selectedCropId, setSelectedCropId] = useState<string>("sunflower-bari2");
  const [sowingDate, setSowingDate] = useState<string>("2026-11-25");
  const [seedbedCondition, setSeedbedCondition] = useState<"MOIST_GOOD" | "SLIGHT_CRUST" | "DRY_HARD">("MOIST_GOOD");
  const [waterAccess, setWaterAccess] = useState<"CANAL_VERIFIED" | "POND_FRESH" | "RIVER_UNCHECKED">("CANAL_VERIFIED");

  // Season view inputs
  const [landAreaBigha, setLandAreaBigha] = useState<number>(3.0); // 1 bigha = 0.133 ha
  const [waterStorageLevel, setWaterStorageLevel] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  const selectedCrop = CROP_CATALOG.find((c) => c.id === selectedCropId) || CROP_CATALOG[0];

  // Sowing Advisory Calculation
  const sowingAdvisory = useMemo(() => {
    let status: "SUITABLE_WINDOW" | "CAUTION" | "MORE_INFO_NEEDED" = "SUITABLE_WINDOW";
    let message = "";
    let messageBn = "";

    if (selectedCrop.id === "rice-brri28") {
      status = "CAUTION";
      message = "HIGH SALINITY RISK: Traditional Boro BRRI dhan28 is vulnerable to March salinity spike. Consider switching to BRRI dhan67 or Sunflower.";
      messageBn = "উচ্চ লবণাক্ততা ঝুঁকি: প্রচলিত ব্রি ধান২৮ চৈত্র মাসের নোনা পানিতে বিনষ্ট হতে পারে। লবণ-সহনশীল ব্রি ধান৬৭ বা সূর্যমুখী বেছে নিন।";
    } else if (waterAccess === "RIVER_UNCHECKED") {
      status = "MORE_INFO_NEEDED";
      message = "Direct river water has not been tested this morning. Verify EC with Dacope facilitator before nursery watering.";
      messageBn = "আজ সকালে সরাসরি নদীর পানি পরীক্ষা করা হয়নি। বীজতলায় পানি দেওয়ার পূর্বে ফ্যাসিলিটেটরের মাধ্যমে ইসি পরীক্ষা করুন।";
    } else if (seedbedCondition === "DRY_HARD") {
      status = "CAUTION";
      message = "Dry crusted seedbed detected. Apply light soaking irrigation from pond or mulched canal water 48 hours prior to dibbling.";
      messageBn = "শুকনো ও শক্ত মাটির স্তর। বীজ রোপণের ৪৮ ঘণ্টা আগে পুকুর বা খালের মিষ্টি পানি দিয়ে হালকা ভিজিয়ে নিন।";
    } else {
      status = "SUITABLE_WINDOW";
      message = `POTENTIALLY SUITABLE WINDOW: ${selectedCrop.name} has low water demand during initial 30 days. Canal EC (1.8 dS/m) is below threshold (${selectedCrop.saltThresholdEce} dS/m).`;
      messageBn = `উপযোগী সময়: প্রাথমিক ৩০ দিনে ${selectedCrop.nameBn} এর পানির চাহিদা কম। খালের বর্তমান ইসি (১.৮ dS/m) সহনশীল সীমার (${selectedCrop.saltThresholdEce} dS/m) নিচে রয়েছে।`;
    }

    return { status, message, messageBn };
  }, [selectedCrop, waterAccess, seedbedCondition]);

  return (
    <div className="w-full max-w-[1520px] mx-auto min-w-0 space-y-6 p-2 sm:p-4 lg:p-6">
      {/* 1. TOP HEADER & VIEW TOGGLES */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-secondary">
              Dacope agronomic pilot
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Crop decision support</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            <span>{lang === "en" ? "Crop Planning & Sowing Windows" : "ফসল পরিকল্পনা ও বপনের সময়সূচি"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl [text-wrap:pretty]">
            {lang === "en"
              ? "Timely short-term sowing advisories coupled with multi-season crop rotation planning for coastal polders."
              : "উপকূলীয় পোল্ডারের জন্য স্বল্পমেয়াদী বপন পরামর্শ এবং তিন-মৌসুমী জলবায়ু-সহনশীল ফসল পরিকল্পনা।"}
          </p>
        </div>

        {/* View Tabs & Language */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setActiveTab("sowing")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "sowing" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {lang === "en" ? "Sowing this week" : "চলতি সপ্তাহের বপন"}
            </button>
            <button
              onClick={() => setActiveTab("season")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === "season" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              {lang === "en" ? "Plan the season" : "মৌসুমভিত্তিক পরিকল্পনা"}
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center text-xs">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                lang === "en" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("bn")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                lang === "bn" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              বাং
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* VIEW 1: SOWING THIS WEEK (SHORT-TERM ESTABLISHMENT WINDOW) */}
      {/* ===================================================================== */}
      {activeTab === "sowing" && (
        <div className="space-y-6">
          {/* Sowing Scope Callout */}
          <div className="p-4 rounded-xl bg-sky-500/[0.04] border border-sky-500/20 flex items-start gap-3 text-xs text-sky-200">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === "en"
                ? "Important Scope: This view evaluates the immediate establishment and sowing window (next 7–14 days) based on current water salinity and local seedbed conditions. It does not guarantee whole-season suitability."
                : "সতর্কবার্তা: এই অংশটি শুধুমাত্র আগামী ৭–১৪ দিনের প্রাথমিক বীজ বপন ও চারার প্রতিষ্ঠার উপযুক্ততা যাচাই করে। এটি পুরো মৌসুমের ফসল নিরাপত্তার নিশ্চয়তা দেয় না।"}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left: Input Form (5 cols) */}
            <div className="lg:col-span-5 space-y-5 w-full min-w-0">
              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{lang === "en" ? "1. Select crop & variety" : "১. ফসল ও জাত নির্বাচন"}</span>
                  </h3>
                  <span className="text-[10px] font-mono text-muted-foreground">Dacope Rabi/Kharif</span>
                </div>

                <div className="space-y-2">
                  {CROP_CATALOG.map((crop) => {
                    const isSelected = crop.id === selectedCropId;
                    return (
                      <button
                        key={crop.id}
                        onClick={() => setSelectedCropId(crop.id)}
                        className={`w-full p-3 rounded-lg text-left border transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-white/[0.08] border-primary/50 text-white"
                            : "bg-white/[0.02] border-white/5 text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <div>
                          <div className="font-medium text-xs text-white">
                            {lang === "en" ? crop.name : crop.nameBn}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            {crop.season} • <span className="tabular-nums font-mono">{crop.durationDays}</span> days • Limit: <span className="tabular-nums font-mono">{crop.saltThresholdEce}</span> dS/m
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isSelected
                              ? "bg-white/10 text-white border-white/20"
                              : "bg-black/30 text-muted-foreground border-white/5"
                          }`}
                        >
                          {crop.type}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Sowing Date Input */}
                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium block">
                    {lang === "en" ? "Planned sowing / transplanting date:" : "বপন বা চারা রোপণের সম্ভাব্য তারিখ:"}
                  </label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                {/* Seedbed Condition */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium block">
                    {lang === "en" ? "Field / seedbed condition:" : "জমির বর্তমান অবস্থা:"}
                  </label>
                  <select
                    value={seedbedCondition}
                    onChange={(e: any) => setSeedbedCondition(e.target.value)}
                    className="w-full bg-[#0d1420] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="MOIST_GOOD">Moist soil, rice-straw mulch available (ভালো আর্দ্রতা ও খড় আছে)</option>
                    <option value="SLIGHT_CRUST">Slight surface salt crust visible (হালকা লবণের স্তর দৃশ্যমান)</option>
                    <option value="DRY_HARD">Dry, hard cracked soil (শুকনো ও শক্ত ফাটলযুক্ত)</option>
                  </select>
                </div>

                {/* Water Access */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium block">
                    {lang === "en" ? "Initial irrigation water source:" : "প্রাথমিক সেচের পানির উৎস:"}
                  </label>
                  <select
                    value={waterAccess}
                    onChange={(e: any) => setWaterAccess(e.target.value)}
                    className="w-full bg-[#0d1420] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="CANAL_VERIFIED">Bajua Canal (Verified EC: 1.8 dS/m - C3)</option>
                    <option value="POND_FRESH">Pankhali Retention Pond (Verified EC: 0.95 dS/m - C2)</option>
                    <option value="RIVER_UNCHECKED">Direct Passur River intake (Unchecked tide)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right: Sowing Window Advisory Output (7 cols) */}
            <div className="lg:col-span-7 space-y-5 w-full min-w-0">
              <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    {sowingAdvisory.status === "SUITABLE_WINDOW" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : sowingAdvisory.status === "CAUTION" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-xs font-semibold text-white">
                      {lang === "en" ? "Reviewed establishment advisory" : "যাচাইকৃত বপন পরামর্শ"}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                      sowingAdvisory.status === "SUITABLE_WINDOW"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        : sowingAdvisory.status === "CAUTION"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                    }`}
                  >
                    {sowingAdvisory.status === "SUITABLE_WINDOW"
                      ? lang === "en" ? "Potentially suitable window" : "উপযোগী সময়"
                      : sowingAdvisory.status === "CAUTION"
                      ? lang === "en" ? "Caution required" : "সতর্কতা আবশ্যক"
                      : lang === "en" ? "More info needed" : "তথ্য যাচাই প্রয়োজন"}
                  </span>
                </div>

                <div className="my-2 space-y-3">
                  <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">
                    {lang === "en" ? sowingAdvisory.message : sowingAdvisory.messageBn}
                  </h4>

                  {/* Seedbed Guidance */}
                  <div className="p-3.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
                    <span className="text-[11px] font-medium text-primary block">
                      {lang === "en" ? "Agronomic & seedbed guidance:" : "কৃষিতাত্ত্বিক ও বীজতলা নির্দেশনা:"}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {selectedCrop.seedbedAdvice}
                    </p>
                  </div>
                </div>

                {/* Metrics Matrix with Tabular Numerals */}
                <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">
                      {lang === "en" ? "Crop salt threshold" : "ফসলের লবণের সীমা"}
                    </span>
                    <span className="text-sm font-medium text-white font-mono tabular-nums mt-0.5 block">
                      {selectedCrop.saltThresholdEce} dS/m
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">
                      {lang === "en" ? "Estimated water EC" : "পানির আনুমানিক ইসি"}
                    </span>
                    <span className="text-sm font-medium text-emerald-400 font-mono tabular-nums mt-0.5 block">
                      1.8 dS/m (C3)
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <span className="text-[10px] text-muted-foreground block">
                      {lang === "en" ? "Establishment need" : "চারার পানির চাহিদা"}
                    </span>
                    <span className="text-sm font-medium text-white font-mono tabular-nums mt-0.5 block">
                      {Math.round(selectedCrop.waterNeedMm * 0.25)} mm
                    </span>
                  </div>
                </div>
              </div>

              {/* What To Do Next Card */}
              <div className="p-5 rounded-xl bg-[#121824] border border-white/10 space-y-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "en" ? "Next verification step" : "পরবর্তী যাচাইকরণ পদক্ষেপ"}</span>
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {lang === "en"
                    ? "Before releasing canal water into the furrow, request a 1-minute EC reading from Dacope Community Water Facilitator M. Rahman. Confirm that external tidal gate has been locked."
                    : "নালায় পানি ছাড়ার পূর্বে দাকোপ কমিউনিটি পানি ফ্যাসিলিটেটরের মাধ্যমে ১ মিনিটের একটি ইসি রিডিং নিশ্চিত করুন। বহিস্থ জোয়ারের গেট বন্ধ আছে কিনা দেখে নিন।"}
                </p>
                <div className="flex items-center justify-between pt-2 text-xs">
                  <Link href="/app/my-water" className="text-primary hover:underline font-medium flex items-center gap-1">
                    <span>{lang === "en" ? "Check current canal salinity" : "খালের বর্তমান লবণাক্ততা দেখুন"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/app/help" className="text-muted-foreground hover:text-white">
                    {lang === "en" ? "Contact facilitator" : "যোগাযোগ করুন"}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sowing Science Infographic */}
          <div className="pt-2">
            <CapillaryMulchInfographic lang={lang} />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: PLAN THE SEASON (SEASONAL CROP COMPARISON & ROTATIONS) */}
      {/* ===================================================================== */}
      {activeTab === "season" && (
        <div className="space-y-6">
          {/* Interactive Seasonal Timeline Infographic */}
          <CropRotationTimelineInfographic lang={lang} />

          {/* Historical Scenarios Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex items-start gap-3 text-xs text-amber-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === "en"
                ? "Methodology Note: Seasonal comparisons use reviewed historical monthly salinity patterns (Dry, Typical, and Wet years) and verified crop budgets from BARI/BRRI. They are not direct extrapolations of the 7-day hydrodynamic model."
                : "পদ্ধতি: মৌসুমভিত্তিক ফসল তুলনা ঐতিহাসিক মাসিক লবণাক্ততা (শুকনো, স্বাভাবিক ও আর্দ্র বছর) এবং বারি/বিআরআরআই-এর পরীক্ষিত তথ্যের ওপর ভিত্তি করে তৈরি। এটি ৭-দিনের মডেলের সরাসরি সম্প্রসারণ নয়।"}
            </p>
          </div>

          {/* Historical Salinity Pattern Strip */}
          <div className="p-5 rounded-xl bg-[#121824] border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span>{lang === "en" ? "Dacope historical monthly salinity trajectory (typical year)" : "দাকোপের ঐতিহাসিক মাসিক লবণাক্ততার গতিধারা (স্বাভাবিক বছর)"}</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">SRDI & BWDB historical data</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 text-center text-xs">
              {[
                { m: "Nov", ec: 3.2, note: "Fresh" },
                { m: "Dec", ec: 4.8, note: "Low" },
                { m: "Jan", ec: 6.5, note: "Moderate" },
                { m: "Feb", ec: 8.9, note: "Rising" },
                { m: "Mar", ec: 12.8, note: "Peak Alert" },
                { m: "Apr", ec: 15.6, note: "Severe" },
                { m: "May", ec: 11.4, note: "High" },
                { m: "Jun", ec: 4.5, note: "Rain Wash" },
                { m: "Jul", ec: 2.1, note: "Fresh" },
                { m: "Aug", ec: 1.6, note: "Fresh" },
                { m: "Sep", ec: 1.8, note: "Fresh" },
                { m: "Oct", ec: 2.4, note: "Fresh" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border transition-all ${
                    item.ec > 10
                      ? "bg-rose-500/10 border-rose-500/25 text-rose-300"
                      : item.ec > 5
                      ? "bg-amber-500/10 border-amber-500/25 text-amber-300"
                      : "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                  }`}
                >
                  <span className="text-[10px] font-mono block text-muted-foreground">{item.m}</span>
                  <span className="font-semibold text-xs font-mono tabular-nums">{item.ec}</span>
                  <span className="text-[9px] block opacity-80 truncate">{item.note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Cards for Rotations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{lang === "en" ? "Reviewed seasonal crop rotations" : "যাচাইকৃত মৌসুমভিত্তিক ফসলের পর্যায়ক্রম"}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                {lang === "en" ? "Calculated per hectare (1 ha ≈ 7.5 bighas)" : "হেক্টর প্রতি হিসাব (১ হেক্টর ≈ ৭.৫ বিঘা)"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {CANDIDATE_ROTATIONS.map((rot) => {
                const isRecommended = rot.overallRating === "RECOMMENDED";
                const isDanger = rot.overallRating === "HIGH_RISK";

                return (
                  <div
                    key={rot.id}
                    className="p-5 rounded-xl bg-[#121824] border border-white/10 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-white">
                            {lang === "en" ? rot.title : rot.titleBn}
                          </h4>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-medium border ${
                              isRecommended
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                : isDanger
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                : "bg-sky-500/10 text-sky-400 border-sky-500/25"
                            }`}
                          >
                            {rot.overallRating === "RECOMMENDED"
                              ? lang === "en" ? "Recommended choice" : "সর্বোত্তম সুপারিশ"
                              : rot.overallRating === "HIGH_RISK"
                              ? lang === "en" ? "High salt risk" : "চরম লবণাক্ততার ঝুঁকি"
                              : lang === "en" ? "Feasible" : "ব্যবহারযোগ্য"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {rot.soilHealthAssessment}
                        </p>
                      </div>

                      {/* Economic Net Profit & Water */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {lang === "en" ? "Annual net profit" : "বার্ষিক নিট লাভ"}
                          </span>
                          <span
                            className={`text-lg font-semibold font-mono tabular-nums ${
                              isDanger ? "text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            ৳ {rot.netProfitBdtPerHa.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right pl-3 border-l border-white/10">
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            {lang === "en" ? "Water footprint" : "পানির খরচ"}
                          </span>
                          <span className="text-sm font-medium font-mono text-white tabular-nums">
                            {rot.waterConsumptionM3.toLocaleString()} m³
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 3 Season Visual Step Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-2">
                      {rot.seasons.map((s, sIdx) => (
                        <div key={sIdx} className="p-3.5 rounded-lg bg-black/20 border border-white/5 space-y-1">
                          <span className="text-[10px] font-mono text-primary font-medium block">
                            {s.name}
                          </span>
                          <div className="font-medium text-xs text-white">{s.crop}</div>
                          <div className="text-[11px] text-muted-foreground">{s.waterSource}</div>
                          <div className="text-[10px] text-emerald-400 font-mono pt-1">
                            {s.expectedYieldTonHa > 0 ? `Est. Yield: ${s.expectedYieldTonHa} ton/ha` : "Fallow (পতিত)"}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sluice Gate Calendar Advice */}
                    <div className="pt-2 text-xs text-muted-foreground flex items-center justify-between border-t border-white/5">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{rot.calendarSluiceAdvice}</span>
                      </span>
                      <span className="font-mono text-white text-[11px] font-medium shrink-0">
                        Cropping intensity: <span className="tabular-nums">{rot.intensityPct}</span>%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
