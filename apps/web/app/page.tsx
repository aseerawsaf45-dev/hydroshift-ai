"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Waves,
  Droplets,
  Calendar,
  Sprout,
  HelpCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  Activity,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { SalinitySpectrumInfographic } from "@/components/infographics/SalinitySpectrumInfographic";

export default function Home() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [selectedVillage, setSelectedVillage] = useState<string>("bajua");

  const villages = [
    {
      id: "bajua",
      name: "Bajua",
      nameBn: "বাজুয়া",
      polder: "Polder 31, Dacope",
      primarySource: "Bajua Main Irrigation Canal",
      primarySourceBn: "বাজুয়া প্রধান সেচ খাল",
      latestEc: 1.8,
      cClass: "C3",
      cClassLabel: "Medium Salinity",
      cClassLabelBn: "সহনীয় মধ্যম লবণাক্ততা",
      freshness: "Verified 2 hours ago",
      freshnessBn: "২ ঘণ্টা আগে যাচাইকৃত",
      nextAction: "Safe irrigation window open for the next 36 hours. Close inlet flap-gate before Friday spring tide.",
      nextActionBn: "আগামী ৩৬ ঘণ্টা জমিতে সেচ দেওয়া নিরাপদ। শুক্রবারের অমাবস্যার জোয়ারের আগে খালের মুখ বন্ধ করুন।",
      status: "Safe Window",
      gaugePct: 35, // visual percentage for meter
    },
    {
      id: "pankhali",
      name: "Pankhali",
      nameBn: "পানখালী",
      polder: "Polder 31, Dacope",
      primarySource: "Pankhali Freshwater Retention Khari",
      primarySourceBn: "পানখালী মিষ্টি পানি সংরক্ষণ খাঁড়ি",
      latestEc: 0.95,
      cClass: "C2",
      cClassLabel: "Fresh / Low Salt",
      cClassLabelBn: "মিষ্টি পানি",
      freshness: "Verified 3 hours ago",
      freshnessBn: "৩ ঘণ্টা আগে যাচাইকৃত",
      nextAction: "Conserve freshwater for seedbed nurseries. Pond drawdown under control; safe for all seedlings.",
      nextActionBn: "বীজতলার জন্য মিষ্টি পানি সংরক্ষণ করুন। পুকুরে পর্যাপ্ত পানি রয়েছে; সকল চারার জন্য নিরাপদ।",
      status: "Optimal",
      gaugePct: 18,
    },
    {
      id: "kamarkhola",
      name: "Kamarkhola",
      nameBn: "কামারখোলা",
      polder: "Polder 32, Dacope",
      primarySource: "Kamarkhola Sluice Outfall Canal",
      primarySourceBn: "কামারখোলা স্লুইস নিষ্কাশন খাল",
      latestEc: 4.8,
      cClass: "C4",
      cClassLabel: "High Salinity Alert",
      cClassLabelBn: "তীব্র লবণাক্ততার সতর্কতা",
      freshness: "Verified yesterday",
      freshnessBn: "গতকাল যাচাইকৃত",
      nextAction: "DO NOT IRRIGATE. Sluice gate locked to prevent saline tidal backflow from Passur River.",
      nextActionBn: "সেচ দিবেন না। পশুর নদী থেকে নোনা পানি প্রবেশ ঠেকাতে স্লুইস গেট তালাবদ্ধ রাখুন।",
      status: "Saline Alert",
      gaugePct: 78,
    },
    {
      id: "sutarkhali",
      name: "Sutarkhali",
      nameBn: "সুতারখালী",
      polder: "Polder 32, Dacope",
      primarySource: "Sutarkhali River Outfall Point",
      primarySourceBn: "সুতারখালী নদী আউটফল পয়েন্ট",
      latestEc: 6.2,
      cClass: "C4",
      cClassLabel: "Severe Salinity",
      cClassLabelBn: "চরম নোনা পানি",
      freshness: "Verified yesterday",
      freshnessBn: "গতকাল যাচাইকৃত",
      nextAction: "River saline intrusion active. Sluice sealed. Use community school rainwater storage for nurseries.",
      nextActionBn: "নদীতে নোনা পানি বেশি। স্লুইস সিল করা। বীজতলায় স্কুলের সংরক্ষিত বৃষ্টির পানি ব্যবহার করুন।",
      status: "Severe Alert",
      gaugePct: 92,
    },
  ];

  const activeVillage = villages.find((v) => v.id === selectedVillage) || villages[0];

  return (
    <main className="min-h-[100dvh] w-full bg-[#04070e] text-foreground overflow-x-hidden selection:bg-primary selection:text-black relative">
      {/* Dynamic Ambient Mesh Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-gradient-to-b from-primary/15 via-cyan-500/10 to-transparent rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[28rem] right-[-10rem] w-[500px] h-[400px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* 1. FLOATING GLASS PILL NAVBAR */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-14 rounded-full bg-[#070e17]/85 backdrop-blur-2xl border border-white/10 px-4 sm:px-6 flex items-center justify-between shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)]">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group btn-tactile">
            <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-300">
              <Waves className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-xs uppercase text-white font-mono">HydroShift</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[8px] font-mono border border-emerald-500/30">
                  PILOT
                </span>
              </div>
              <span className="text-[9px] text-muted-foreground font-mono">Dacope Community Service</span>
            </div>
          </Link>

          {/* Simple 4-Item Menu Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="text-white hover:text-primary transition-colors">
              {lang === "en" ? "Home" : "মূলপাতা"}
            </Link>
            <Link href="/app/my-water" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-primary" />
              <span>{lang === "en" ? "My Water" : "আমার পানি"}</span>
            </Link>
            <Link href="/app/crop-planning" className="hover:text-white transition-colors flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === "en" ? "Crop Planning" : "ফসল পরিকল্পনা"}</span>
            </Link>
            <Link href="/app/help" className="hover:text-white transition-colors flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>{lang === "en" ? "Help & Contacts" : "সাহায্য ও যোগাযোগ"}</span>
            </Link>
          </div>

          {/* Language Switcher & Quick Launch */}
          <div className="flex items-center gap-2.5">
            <div className="bg-white/5 border border-white/10 rounded-full p-0.5 flex items-center text-xs">
              <button
                onClick={() => setLang("en")}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  lang === "en" ? "bg-primary text-black font-bold shadow-sm" : "text-muted-foreground hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  lang === "bn" ? "bg-primary text-black font-bold shadow-sm" : "text-muted-foreground hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>

            <Link
              href="/app/my-water"
              className="btn-tactile px-4 py-1.5 rounded-full bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-[0_0_20px_rgba(87,214,208,0.3)]"
            >
              <span>{lang === "en" ? "Check Water" : "পানি পরীক্ষা"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO: COMMUNITY-FIRST REVISION */}
      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 px-4 flex flex-col items-center text-center">
        {/* Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 backdrop-blur-xl mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px] font-semibold tracking-wide uppercase">
            {lang === "en" ? "Dacope Pilot Community (Polders 31 & 32)" : "দাকোপ পাইলট কমিউনিটি (পোল্ডার ৩১ ও ৩২)"}
          </span>
        </div>

        {/* Central Headline */}
        <h1 className="w-full max-w-4xl text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
          {lang === "en" ? (
            <>
              Local water information for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-200 to-sky-400">
                timely farming decisions
              </span>.
            </>
          ) : (
            <>
              উপকূলীয় কৃষকদের জন্য স্থানীয় পানির তথ্য ও{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-cyan-200 to-sky-400">
                সময়োপযোগী চাষাবাদের সিদ্ধান্ত
              </span>।
            </>
          )}
        </h1>

        {/* Body Paragraph */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed [text-wrap:pretty]">
          {lang === "en"
            ? "Know your canal water's salinity class today, choose the right sowing and irrigation window, and plan resilient crop rotations before coastal salt levels surge."
            : "আজকের খালের পানির লবণাক্ততার শ্রেণি জানুন, সঠিক বীজ বপন ও সেচের উপযুক্ত সময় নির্বাচন করুন এবং লবণাক্ততা বৃদ্ধির আগেই তিন-মৌসুমী লাভজনক ফসল পরিকল্পনা করুন।"}
        </p>

        {/* 3 LINKED ACTION CARDS: DOUBLE-BEZEL ARCHITECTURE */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
          {/* Card 1: Check My Water */}
          <Link href="/app/my-water" className="bezel-shell group block btn-tactile text-left">
            <div className="bezel-core p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-300">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    C1 – C4
                  </span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors flex items-center justify-between">
                  <span>{lang === "en" ? "1. Check My Water" : "১. আমার পানি পরীক্ষা"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "View today's measured EC salinity class, timestamped sample, and safe irrigation windows for your village canal."
                    : "আপনার খালের আজকের লবণাক্ততার শ্রেণি (C1-C4), মাপার সময় এবং নিরাপদ সেচের সময়সীমা দেখুন।"}
                </p>
              </div>

              {/* Nested Island Button-in-Button */}
              <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white group-hover:text-primary">
                <span>{lang === "en" ? "Open Water Status" : "পানির অবস্থা দেখুন"}</span>
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 2: Sowing & Irrigation Advice */}
          <Link href="/app/crop-planning?tab=sowing" className="bezel-shell group block btn-tactile text-left">
            <div className="bezel-core p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:bg-emerald-500/20 transition-all duration-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    7–14 DAYS
                  </span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                  <span>{lang === "en" ? "2. Sowing This Week" : "২. চলতি সপ্তাহের বপন"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "Select your intended crop and seedbed status. Receive a reviewed 7–14 day establishment advisory window."
                    : "আপনার নির্ধারিত ফসল ও বীজতলার অবস্থা বেছে নিন। আগামী ৭–১৪ দিনের জন্য উপযুক্ত বপনের সময়সূচি জানুন।"}
                </p>
              </div>

              {/* Nested Island Button-in-Button */}
              <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white group-hover:text-emerald-300">
                <span>{lang === "en" ? "Check Sowing Window" : "বপন সময়সূচি দেখুন"}</span>
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>

          {/* Card 3: Plan the Season */}
          <Link href="/app/crop-planning?tab=season" className="bezel-shell group block btn-tactile text-left">
            <div className="bezel-core p-6 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 group-hover:bg-sky-500/20 transition-all duration-300">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    300% INTENSITY
                  </span>
                </div>
                <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
                  <span>{lang === "en" ? "3. Plan the Season" : "৩. ফসল পরিকল্পনা"}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "Compare multi-season crop rotations (Sunflower, Mungbean, Salt-Rice) with water budgets and net returns."
                    : "সূর্যমুখী, মুগডাল এবং লবণ-সহনশীল ধানের তিন-মৌসুমী পর্যায়ক্রমের লাভ ও পানির চাহিদার তুলনামূলক চিত্র।"}
                </p>
              </div>

              {/* Nested Island Button-in-Button */}
              <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white group-hover:text-sky-300">
                <span>{lang === "en" ? "Compare Rotations" : "পর্যায়ক্রম তুলনা করুন"}</span>
                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-sky-400 group-hover:text-black group-hover:translate-x-1 transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. EVIDENCE FRESHNESS & VILLAGE PREVIEW (DOUBLE-BEZEL) */}
      <section className="px-4 pb-20 max-w-5xl mx-auto space-y-6">
        <div className="bezel-shell">
          <div className="bezel-core p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  {lang === "en" ? "Select Your Pilot Village / Water Source" : "আপনার গ্রাম বা পানির উৎস বেছে নিন"}
                </h2>
              </div>
              <span className="text-xs text-muted-foreground font-mono">Dacope Polders 31 & 32</span>
            </div>

            {/* Village Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {villages.map((v) => {
                const isSelected = v.id === selectedVillage;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVillage(v.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all btn-tactile ${
                      isSelected
                        ? "bg-primary text-black font-bold border-primary shadow-lg shadow-primary/25"
                        : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div className="text-xs font-semibold">{lang === "en" ? v.name : v.nameBn}</div>
                    <div className={`text-[10px] mt-1 font-mono tabular-nums ${isSelected ? "text-black/80 font-bold" : "text-muted-foreground"}`}>
                      {v.latestEc} dS/m ({v.cClass})
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Evidence & Action Box */}
            <div className="p-5 rounded-2xl bg-black/50 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">{lang === "en" ? "Monitored Waterway:" : "পর্যবেক্ষিত উৎস:"} </span>
                  <span className="font-bold text-white">
                    {lang === "en" ? activeVillage.primarySource : activeVillage.primarySourceBn}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lang === "en" ? activeVillage.freshness : activeVillage.freshnessBn}</span>
                </div>
              </div>

              {/* Salinity Gauge Visual Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-muted-foreground">Measured Salinity Spectrum:</span>
                  <span className="text-white font-bold tabular-nums">
                    {activeVillage.latestEc} dS/m ({activeVillage.cClass} - {lang === "en" ? activeVillage.cClassLabel : activeVillage.cClassLabelBn})
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      activeVillage.latestEc <= 1.5
                        ? "bg-gradient-to-r from-emerald-400 to-sky-400"
                        : activeVillage.latestEc <= 3.0
                        ? "bg-gradient-to-r from-sky-400 via-amber-400 to-orange-400"
                        : "bg-gradient-to-r from-orange-500 to-rose-500"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, activeVillage.gaugePct))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-muted-foreground pt-0.5">
                  <span>0 dS/m (C1)</span>
                  <span>1.5 dS/m (C2/C3)</span>
                  <span>3.0 dS/m (C3/C4)</span>
                  <span>6.0+ dS/m (Severe)</span>
                </div>
              </div>

              {/* Immediate Next Action Banner */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-primary block">
                    {lang === "en" ? "Immediate Next Action" : "তাৎক্ষণিক করণীয় পদক্ষেপ"}
                  </span>
                  <p className="text-xs text-white mt-0.5 font-medium leading-relaxed [text-wrap:pretty]">
                    {lang === "en" ? activeVillage.nextAction : activeVillage.nextActionBn}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3.5 SALINITY SPECTRUM INFOGRAPHIC */}
        <div className="w-full">
          <SalinitySpectrumInfographic lang={lang} />
        </div>

        {/* 4. FACILITATOR & SERVICE TRUST CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bezel-shell">
            <div className="bezel-core p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs text-left">
                  <div className="font-bold text-white">M. Rahman (রহমান)</div>
                  <div className="text-[11px] text-muted-foreground">Dacope Water Facilitator</div>
                  <a href="tel:+8801712345678" className="text-primary font-mono font-bold hover:underline tabular-nums">
                    +880 1712-345678
                  </a>
                </div>
              </div>
              <Link
                href="/app/help"
                className="btn-tactile text-xs text-muted-foreground hover:text-white flex items-center gap-1"
              >
                <span>{lang === "en" ? "Help" : "সহায়তা"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bezel-shell">
            <div className="bezel-core p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs text-left">
                  <div className="font-bold text-white">
                    {lang === "en" ? "Shared Community Service" : "শেয়ার্ড কমিউনিটি সেবা"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {lang === "en"
                      ? "One calibrated EC meter serves the whole village."
                      : "একটি নির্ভুল ইসি মিটারের মাধ্যমে পুরো গ্রামের চাষীদের সেবা।"}
                  </div>
                </div>
              </div>
              <Link
                href="/app/facilitator"
                className="btn-tactile text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <span>{lang === "en" ? "Log Reading" : "লগইন"}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER WITH RESEARCH METHODS LINK */}
      <footer className="border-t border-white/10 py-10 px-4 text-center text-xs text-muted-foreground space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">
            {lang === "en" ? "Home" : "মূলপাতা"}
          </Link>
          <span>•</span>
          <Link href="/app/my-water" className="hover:text-white transition-colors">
            {lang === "en" ? "My Water" : "আমার পানি"}
          </Link>
          <span>•</span>
          <Link href="/app/crop-planning" className="hover:text-white transition-colors">
            {lang === "en" ? "Crop Planning" : "ফসল পরিকল্পনা"}
          </Link>
          <span>•</span>
          <Link href="/app/help" className="hover:text-white transition-colors">
            {lang === "en" ? "Help & Contacts" : "সহায়তা ও যোগাযোগ"}
          </Link>
          <span>•</span>
          <Link href="/app/methods" className="text-primary hover:underline font-semibold flex items-center gap-1">
            <span>{lang === "en" ? "Research Methods & Models" : "বৈজ্ঞানিক পদ্ধতি ও মডেল"}</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/70 max-w-xl mx-auto [text-wrap:pretty]">
          HydroShift AI Community Pilot • Developed for coastal agricultural resilience in Southwest Bangladesh • Powered by NASA SWOT & Field Hydrometry
        </p>
      </footer>
    </main>
  );
}
