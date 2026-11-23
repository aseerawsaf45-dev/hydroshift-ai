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
    <main className="min-h-[100dvh] w-full bg-[#090e17] text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-white relative">
      {/* 1. QUIET CRAFT NAVBAR */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-12 rounded-xl bg-[#0d131f]/95 backdrop-blur-md border border-white/10 px-4 sm:px-5 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 btn-tactile">
            <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary">
              <Waves className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-xs text-white">HydroShift</span>
                <span className="px-1.5 py-0.2 rounded bg-white/10 text-muted-foreground text-[9px] font-mono">
                  Pilot
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">Dacope community service</span>
            </div>
          </Link>

          {/* Simple 4-Item Menu Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-muted-foreground">
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
            <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center text-xs">
              <button
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  lang === "en" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  lang === "bn" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>

            <Link
              href="/app/my-water"
              className="btn-tactile px-3.5 py-1.5 rounded-lg bg-primary text-[#090e17] font-semibold text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              <span>{lang === "en" ? "Check Water" : "পানি পরীক্ষা"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO: COMMUNITY-FIRST REVISION */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4 flex flex-col items-center text-center">
        {/* Eyebrow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-secondary mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-medium">
            {lang === "en" ? "Dacope pilot community (Polders 31 & 32)" : "দাকোপ পাইলট কমিউনিটি (পোল্ডার ৩১ ও ৩২)"}
          </span>
        </div>

        {/* Central Headline */}
        <h1 className="w-full max-w-3xl text-2xl sm:text-4xl md:text-5xl font-medium tracking-tight text-white leading-tight [text-wrap:balance]">
          {lang === "en" ? (
            <>
              Local water information for{" "}
              <span className="text-primary font-semibold">
                timely farming decisions
              </span>
            </>
          ) : (
            <>
              উপকূলীয় কৃষকদের জন্য স্থানীয় পানির তথ্য ও{" "}
              <span className="text-primary font-semibold">
                সময়োপযোগী চাষাবাদের সিদ্ধান্ত
              </span>
            </>
          )}
        </h1>

        {/* Body Paragraph */}
        <p className="mt-4 text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed [text-wrap:pretty]">
          {lang === "en"
            ? "Know your canal water salinity class today, choose the right sowing and irrigation window, and plan resilient crop rotations before coastal salt levels surge."
            : "আজকের খালের পানির লবণাক্ততার শ্রেণি জানুন, সঠিক বীজ বপন ও সেচের উপযুক্ত সময় নির্বাচন করুন এবং লবণাক্ততা বৃদ্ধির আগেই তিন-মৌসুমী লাভজনক ফসল পরিকল্পনা করুন।"}
        </p>

        {/* 3 LINKED ACTION CARDS: CLEAN INSTRUMENT PANELS */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl">
          {/* Card 1: Check My Water */}
          <Link href="/app/my-water" className="group block btn-tactile text-left p-5 bg-[#121824] hover:bg-[#151d2c] rounded-xl border border-white/10">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-secondary border border-white/10">
                    C1–C4
                  </span>
                </div>
                <h3 className="font-medium text-sm text-white group-hover:text-primary transition-colors">
                  {lang === "en" ? "1. Check My Water" : "১. আমার পানি পরীক্ষা"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "View today's measured EC salinity class, timestamped sample, and safe irrigation windows for your village canal."
                    : "আপনার খালের আজকের লবণাক্ততার শ্রেণি (C1-C4), মাপার সময় এবং নিরাপদ সেচের সময়সীমা দেখুন।"}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-secondary group-hover:text-primary">
                <span>{lang === "en" ? "Open water status" : "পানির অবস্থা দেখুন"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Sowing & Irrigation Advice */}
          <Link href="/app/crop-planning?tab=sowing" className="group block btn-tactile text-left p-5 bg-[#121824] hover:bg-[#151d2c] rounded-xl border border-white/10">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-secondary border border-white/10">
                    7–14 days
                  </span>
                </div>
                <h3 className="font-medium text-sm text-white group-hover:text-emerald-300 transition-colors">
                  {lang === "en" ? "2. Sowing This Week" : "২. চলতি সপ্তাহের বপন"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "Select your intended crop and seedbed status. Receive a reviewed 7–14 day establishment advisory window."
                    : "আপনার নির্ধারিত ফসল ও বীজতলার অবস্থা বেছে নিন। আগামী ৭–১৪ দিনের জন্য উপযুক্ত বপনের সময়সূচি জানুন।"}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-secondary group-hover:text-emerald-300">
                <span>{lang === "en" ? "Check sowing window" : "বপন সময়সূচি দেখুন"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Plan the Season */}
          <Link href="/app/crop-planning?tab=season" className="group block btn-tactile text-left p-5 bg-[#121824] hover:bg-[#151d2c] rounded-xl border border-white/10">
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sky-400">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-secondary border border-white/10">
                    Multi-season
                  </span>
                </div>
                <h3 className="font-medium text-sm text-white group-hover:text-sky-300 transition-colors">
                  {lang === "en" ? "3. Plan the Season" : "৩. ফসল পরিকল্পনা"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed [text-wrap:pretty]">
                  {lang === "en"
                    ? "Compare multi-season crop rotations (Sunflower, Mungbean, Salt-Rice) with water budgets and net returns."
                    : "সূর্যমুখী, মুগডাল এবং লবণ-সহনশীল ধানের তিন-মৌসুমী পর্যায়ক্রমের লাভ ও পানির চাহিদার তুলনামূলক চিত্র।"}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-secondary group-hover:text-sky-300">
                <span>{lang === "en" ? "Compare rotations" : "পর্যায়ক্রম তুলনা করুন"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. EVIDENCE FRESHNESS & VILLAGE PREVIEW */}
      <section className="px-4 pb-16 max-w-5xl mx-auto space-y-5">
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-medium text-white">
                {lang === "en" ? "Select your pilot village / water source" : "আপনার গ্রাম বা পানির উৎস বেছে নিন"}
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Dacope Polders 31 & 32</span>
          </div>

          {/* Village Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {villages.map((v) => {
              const isSelected = v.id === selectedVillage;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVillage(v.id)}
                  className={`p-3 rounded-lg text-left border transition-colors btn-tactile ${
                    isSelected
                      ? "bg-white/[0.08] text-white border-primary/50"
                      : "bg-white/[0.02] text-muted-foreground hover:text-white border-white/5 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-xs font-medium">{lang === "en" ? v.name : v.nameBn}</div>
                  <div className="text-[10px] mt-0.5 font-mono tabular-nums text-secondary">
                    {v.latestEc} dS/m ({v.cClass})
                  </div>
                </button>
              );
            })}
          </div>

          {/* Evidence & Action Box */}
          <div className="p-4 rounded-lg bg-[#0c111a] border border-white/5 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{lang === "en" ? "Monitored waterway:" : "পর্যবেক্ষিত উৎস:"} </span>
                <span className="font-medium text-white">
                  {lang === "en" ? activeVillage.primarySource : activeVillage.primarySourceBn}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-secondary font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{lang === "en" ? activeVillage.freshness : activeVillage.freshnessBn}</span>
              </div>
            </div>

            {/* Salinity Gauge Visual Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground">Measured salinity:</span>
                <span className="text-white font-medium tabular-nums">
                  {activeVillage.latestEc} dS/m ({activeVillage.cClass} - {lang === "en" ? activeVillage.cClassLabel : activeVillage.cClassLabelBn})
                </span>
              </div>
              <div className="h-2 w-full rounded bg-white/10 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded ${
                    activeVillage.latestEc <= 1.5
                      ? "bg-emerald-400"
                      : activeVillage.latestEc <= 3.0
                      ? "bg-amber-400"
                      : "bg-rose-400"
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
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono text-muted-foreground block">
                  {lang === "en" ? "Immediate next action" : "তাৎক্ষণিক করণীয় পদক্ষেপ"}
                </span>
                <p className="text-xs text-foreground mt-0.5 leading-relaxed [text-wrap:pretty]">
                  {lang === "en" ? activeVillage.nextAction : activeVillage.nextActionBn}
                </p>
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
          <div className="p-4 rounded-xl bg-[#121824] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-primary shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-left">
                <div className="font-medium text-white">M. Rahman</div>
                <div className="text-[11px] text-muted-foreground">Dacope water facilitator</div>
                <a href="tel:+8801712345678" className="text-primary font-mono hover:underline tabular-nums">
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

          <div className="p-4 rounded-xl bg-[#121824] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="text-xs text-left">
                <div className="font-medium text-white">
                  {lang === "en" ? "Shared community service" : "শেয়ার্ড কমিউনিটি সেবা"}
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
              className="btn-tactile text-xs text-primary font-medium hover:underline flex items-center gap-1"
            >
              <span>{lang === "en" ? "Portal" : "পোর্টাল"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
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
