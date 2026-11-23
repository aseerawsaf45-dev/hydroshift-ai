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
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function Home() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [selectedVillage, setSelectedVillage] = useState<string>("bajua");

  const villages = [
    {
      id: "bajua",
      name: "Bajua (বাজুয়া)",
      polder: "Polder 31, Dacope",
      primarySource: "Bajua Main Irrigation Canal",
      latestEc: "1.8 dS/m (C3)",
      freshness: "Verified 2 hours ago by M. Rahman",
      nextAction: "Safe irrigation window open next 36h. Close flap gate before Friday spring tide.",
      nextActionBn: "আগামী ৩৬ ঘণ্টা সেচ দেওয়া নিরাপদ। শুক্রবারের জোয়ারের আগে খালের মুখ বন্ধ করুন।",
      status: "Safe Window",
    },
    {
      id: "pankhali",
      name: "Pankhali (পানখালী)",
      polder: "Polder 31, Dacope",
      primarySource: "Pankhali Freshwater Retention Khari",
      latestEc: "0.95 dS/m (C2)",
      freshness: "Verified 3 hours ago by M. Rahman",
      nextAction: "Conserve freshwater for seedbed nurseries. Pond drawdown under control.",
      nextActionBn: "বীজতলার জন্য মিষ্টি পানি সংরক্ষণ করুন। পুকুরে পর্যাপ্ত পানি রয়েছে।",
      status: "Optimal",
    },
    {
      id: "kamarkhola",
      name: "Kamarkhola (কামারখোলা)",
      polder: "Polder 32, Dacope",
      primarySource: "Kamarkhola Sluice Outfall Canal",
      latestEc: "4.8 dS/m (C4)",
      freshness: "Verified yesterday by S. Mondal",
      nextAction: "DO NOT IRRIGATE. Sluice gate locked to block saline tidal backflow.",
      nextActionBn: "সেচ দিবেন না। নোনা পানি প্রবেশ ঠেকাতে স্লুইস গেট তালাবদ্ধ রাখুন।",
      status: "Saline Alert",
    },
    {
      id: "sutarkhali",
      name: "Sutarkhali (সুতারখালী)",
      polder: "Polder 32, Dacope",
      primarySource: "Sutarkhali River Outfall Point",
      latestEc: "6.2 dS/m (C4)",
      freshness: "Verified yesterday by S. Mondal",
      nextAction: "River saline intrusion active. Use school rainwater tank for seedbeds.",
      nextActionBn: "নদীতে নোনা পানি বেশি। বীজতলায় স্কুলের সংরক্ষিত বৃষ্টির পানি ব্যবহার করুন।",
      status: "Severe Alert",
    },
  ];

  const activeVillage = villages.find((v) => v.id === selectedVillage) || villages[0];

  return (
    <main className="min-h-[100dvh] w-full bg-[#05070d] text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
      {/* 1. FLOATING NAVIGATION BAR */}
      <header className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-14 rounded-full bg-[#08131f]/90 backdrop-blur-2xl border border-white/15 px-4 sm:px-6 flex items-center justify-between shadow-2xl">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <Waves className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-xs uppercase text-white font-mono">HydroShift</span>
              <span className="text-[9px] text-muted-foreground font-mono">Dacope Community Pilot</span>
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
                  lang === "en" ? "bg-primary text-black font-bold" : "text-muted-foreground hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                  lang === "bn" ? "bg-primary text-black font-bold" : "text-muted-foreground hover:text-white"
                }`}
              >
                বাং
              </button>
            </div>

            <Link
              href="/app/my-water"
              className="px-4 py-1.5 rounded-full bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-1 shadow-md shadow-primary/20"
            >
              <span>{lang === "en" ? "Check Water" : "পানি পরীক্ষা"}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. HERO: SIMPLIFIED LOCAL MESSAGE */}
      <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 px-4 flex flex-col items-center text-center">
        {/* Subtle Ambient Wash */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Community Scope Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground backdrop-blur-xl mb-6 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-white text-[11px] font-medium">
            {lang === "en"
              ? "Dacope Pilot Community (Polder 31 & 32) • Real Field Delivery"
              : "দাকোপ পাইলট কমিউনিটি (পোল্ডার ৩১ ও ৩২) • বাস্তব মাঠপর্যায়ের সেবা"}
          </span>
        </div>

        {/* Central Headline from Simplification Plan */}
        <h1 className="w-full max-w-4xl text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
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

        {/* Practical Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
          {lang === "en"
            ? "Know your canal water's salinity class today, choose the right sowing and irrigation window, and plan resilient crop rotations before coastal salt levels surge."
            : "আজকের খালের পানির লবণাক্ততার শ্রেণি জানুন, সঠিক বীজ বপন ও সেচের উপযুক্ত সময় নির্বাচন করুন এবং লবণাক্ততা বৃদ্ধির আগেই তিন-মৌসুমী লাভজনক ফসল পরিকল্পনা করুন।"}
        </p>

        {/* 3 LINKED ACTION ENTRY BUTTONS */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
          {/* Action 1: Check My Water */}
          <Link
            href="/app/my-water"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a2d] to-[#081320] border border-primary/40 hover:border-primary text-left transition-all shadow-xl hover:shadow-primary/20 hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-primary transition-colors flex items-center justify-between">
              <span>{lang === "en" ? "1. Check My Water" : "১. আমার পানি পরীক্ষা"}</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {lang === "en"
                ? "View today's measured EC salinity class (C1–C4), timestamp, and safe irrigation windows for your village canal."
                : "আপনার গ্রামের খালের আজকের লবণাক্ততার শ্রেণি (C1-C4), মাপার সময় এবং নিরাপদ সেচের সময়সীমা দেখুন।"}
            </p>
          </Link>

          {/* Action 2: Sowing & Irrigation Advice */}
          <Link
            href="/app/crop-planning"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#0c2420] to-[#081320] border border-emerald-500/40 hover:border-emerald-400 text-left transition-all shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
              <span>{lang === "en" ? "2. Sowing This Week" : "২. চলতি সপ্তাহের বপন"}</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {lang === "en"
                ? "Select your intended crop and seedbed status. Receive a reviewed 7–14 day establishment advisory window."
                : "আপনার নির্ধারিত ফসল ও বীজতলার অবস্থা বেছে নিন। আগামী ৭–১৪ দিনের জন্য উপযুক্ত বপনের সময়সূচি জানুন।"}
            </p>
          </Link>

          {/* Action 3: Plan the Season */}
          <Link
            href="/app/crop-planning?tab=season"
            className="p-5 rounded-2xl bg-gradient-to-br from-[#1c182d] to-[#081320] border border-sky-500/40 hover:border-sky-400 text-left transition-all shadow-xl hover:shadow-sky-500/20 hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors flex items-center justify-between">
              <span>{lang === "en" ? "3. Plan the Season" : "৩. ফসল পরিকল্পনা"}</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {lang === "en"
                ? "Compare multi-season crop rotations (Sunflower, Mungbean, Salt-Rice) with water budgets and net returns."
                : "সূর্যমুখী, মুগডাল এবং লবণ-সহনশীল ধানের তিন-মৌসুমী পর্যায়ক্রমের লাভ ও পানির চাহিদার তুলনামূলক চিত্র।"}
            </p>
          </Link>
        </div>
      </section>

      {/* 3. EVIDENCE FRESHNESS, NEXT ACTION & LOCAL CONTACT */}
      <section className="px-4 pb-20 max-w-4xl mx-auto space-y-6">
        {/* Village Quick Selector Strip */}
        <div className="p-5 rounded-2xl bg-[#081320] border border-white/15 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                {lang === "en" ? "Select Your Pilot Village / Water Source" : "আপনার গ্রাম বা পানির উৎস বেছে নিন"}
              </h2>
            </div>
            <span className="text-xs text-muted-foreground font-mono">Dacope Polders 31 & 32</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {villages.map((v) => {
              const isSelected = v.id === selectedVillage;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVillage(v.id)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    isSelected
                      ? "bg-primary text-black font-bold border-primary shadow-lg shadow-primary/20"
                      : "bg-white/[0.03] text-muted-foreground hover:text-white border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xs font-semibold">{v.name}</div>
                  <div className={`text-[10px] mt-0.5 font-mono ${isSelected ? "text-black/80" : "text-muted-foreground"}`}>
                    {v.latestEc}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Evidence Details Card for Selected Village */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">{lang === "en" ? "Monitored Point:" : "পর্যবেক্ষিত উৎস:"} </span>
                <span className="font-bold text-white">{activeVillage.primarySource}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>{activeVillage.freshness}</span>
              </div>
            </div>

            {/* Next Action Box */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-primary block">
                  {lang === "en" ? "Immediate Next Action" : "তাৎক্ষণিক করণীয় পদক্ষেপ"}
                </span>
                <p className="text-xs text-white mt-0.5 font-medium leading-relaxed">
                  {lang === "en" ? activeVillage.nextAction : activeVillage.nextActionBn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Contact & Shared Community Service Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#081320] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">M. Rahman (রহমান)</div>
                <div className="text-[11px] text-muted-foreground">Dacope Water Facilitator</div>
                <a href="tel:+8801712345678" className="text-primary font-mono font-semibold hover:underline">
                  +880 1712-345678
                </a>
              </div>
            </div>
            <Link
              href="/app/help"
              className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
            >
              <span>{lang === "en" ? "Help Guide" : "সহায়তা"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-4 rounded-2xl bg-[#081320] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">
                  {lang === "en" ? "Shared Community Service" : "শেয়ার্ড কমিউনিটি সেবা"}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {lang === "en"
                    ? "One shared calibrated EC meter serves the whole village."
                    : "একটি নির্ভুল ইসি মিটারের মাধ্যমে পুরো গ্রামের চাষীদের সেবা।"}
                </div>
              </div>
            </div>
            <Link
              href="/app/facilitator"
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>{lang === "en" ? "Facilitator Portal" : "লগইন"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FOOTER WITH METHODS LINK */}
      <footer className="border-t border-white/10 py-8 px-4 text-center text-xs text-muted-foreground space-y-2">
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
        <p className="text-[11px] text-muted-foreground/80 max-w-xl mx-auto">
          HydroShift AI Community Pilot • Developed for coastal resilience in Southwest Bangladesh • Powered by NASA SWOT & Field Hydrometry
        </p>
      </footer>
    </main>
  );
}
