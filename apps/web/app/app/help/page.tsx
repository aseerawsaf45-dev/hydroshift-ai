"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Droplets,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  FileCheck,
} from "lucide-react";

export default function HelpPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#05070d] text-foreground p-3 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <Badge variant="outline" className="text-[11px] font-mono uppercase bg-primary/10 text-primary border-primary/30">
              Community Service & Support // সাহায্য ও যোগাযোগ
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-7 h-7 text-primary" />
            <span>{lang === "en" ? "Help, Contacts & Water Guide" : "সহায়তা, যোগাযোগ ও পানির নির্দেশিকা"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            {lang === "en"
              ? "Contact your local community water facilitator in Dacope, understand salinity classes, and report field issues."
              : "দাকোপের স্থানীয় পানি ফ্যাসিলিটেটরের সাথে যোগাযোগ, লবণাক্ততার শ্রেণিবিভাগ নির্দেশিকা এবং সমস্যা রিপোর্ট করার মাধ্যম।"}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs self-start sm:self-center">
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
      </div>

      {/* 2. LOCAL COMMUNITY FACILITATOR CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bezel-shell p-1 rounded-3xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/30 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === "en" ? "Dacope Water Facilitator" : "দাকোপ পানি ফ্যাসিলিটেটর"}
                </h3>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                {lang === "en" ? "Active in Field" : "মাঠে কর্মরত"}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-base font-bold text-white">Md. Mokhlesur Rahman (রহমান)</div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {lang === "en"
                  ? "Community EC Meter Custodian & Water Monitor (Polder 31 & 32)"
                  : "কমিউনিটি ইসি মিটার তত্ত্বাবধায়ক ও পানি পর্যবেক্ষক (পোল্ডার ৩১ ও ৩২)"}
              </div>
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <a
                  href="tel:+8801712345678"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-black font-bold text-xs hover:opacity-90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: +880 1712-345678</span>
                </a>
                <a
                  href="https://wa.me/8801712345678"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/15 text-xs font-semibold transition-all"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </a>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{lang === "en" ? "Available Daily: 07:00 AM – 06:00 PM" : "দৈনিক সময়: সকাল ৭:০০ – সন্ধ্যা ৬:০০"}</span>
              </div>
              <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>{lang === "en" ? "Stationed at Bajua Union Council, Dacope" : "বাজুয়া ইউনিয়ন পরিষদ কমপ্লেক্স, দাকোপ"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
          <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {lang === "en" ? "Agricultural Extension (DAE)" : "উপজেলা কৃষি সম্প্রসারণ অধিদপ্তর"}
                </h3>
              </div>
              <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-muted-foreground font-mono">
                Govt Liaison
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-base font-bold text-white">Sub-Assistant Agriculture Officer (SAAO)</div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {lang === "en"
                  ? "Department of Agricultural Extension (DAE), Dacope Upazila, Khulna"
                  : "কৃষি সম্প্রসারণ অধিদপ্তর, দাকোপ উপজেলা, খুলনা"}
              </div>
              <div className="pt-2 text-white font-mono text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Office Hotline:</span>
                <a href="tel:+88041762340" className="hover:underline text-primary font-bold">
                  +880 41-762340
                </a>
              </div>
              <div className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                {lang === "en"
                  ? "Provides seed distribution, salt-tolerant variety advice, and official farming guidelines."
                  : "লবণ-সহনশীল ধানের বীজ বিতরণ, কৃষি প্রণোদনা এবং পরামর্শ প্রদান করে থাকে।"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. UNDERSTANDING WATER SALINITY CLASSES (C1 - C4) */}
      <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
        <div className="bezel-core p-6 rounded-[20px] bg-[#081320] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-primary" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {lang === "en" ? "Water Salinity Classification Guide (C1 – C4)" : "পানির লবণাক্ততার শ্রেণিবিভাগ নির্দেশিকা"}
              </h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">FAO 29 & USDA Standards</span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {lang === "en"
              ? "Water electrical conductivity (ECw) is measured in deciSiemens per meter (dS/m) standardized to 25°C. Soil root-zone salinity (ECe) is generally 1.5 times higher than the applied irrigation water."
              : "পানির তড়িৎ পরিবাহিতা (ECw) ২৫° সেলসিয়াসে dS/m এককে মাপা হয়। মাটির মূল স্তরের লবণাক্ততা (ECe) সাধারণত সেচের পানির তুলনায় প্রায় ১.৫ গুণ বেশি হয়ে থাকে।"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5 shadow-sm shadow-emerald-950/40">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 font-mono tabular-nums">
                C1: &lt; 0.75 dS/m
              </span>
              <div className="font-bold text-sm text-white">{lang === "en" ? "Low Salinity" : "মিষ্টি পানি"}</div>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                {lang === "en"
                  ? "Safe for all crops, young seedbeds, and sensitive vegetables. No special leaching required."
                  : "সকল ফসল, বীজতলা এবং শাকসবজির জন্য সম্পূর্ণ নিরাপদ। বিশেষ কোনো সতর্কতা প্রয়োজন নেই।"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 space-y-1.5 shadow-sm shadow-sky-950/40">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-500/20 text-sky-400 font-mono tabular-nums">
                C2: 0.75 – 1.5 dS/m
              </span>
              <div className="font-bold text-sm text-white">{lang === "en" ? "Medium Salinity" : "সহনীয় পানি"}</div>
              <p className="text-[11px] text-sky-200/80 leading-relaxed">
                {lang === "en"
                  ? "Suitable for most crops (Mungbean, Mustard, Maize, Aman). Moderate leaching recommended."
                  : "অধিকাংশ রবি ফসল এবং আমন ধানের জন্য উপযোগী। বীজতলায় কিছুটা সতর্কতা অবলম্বন করুন।"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 shadow-sm shadow-amber-950/40">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 font-mono tabular-nums">
                C3: 1.5 – 3.0 dS/m
              </span>
              <div className="font-bold text-sm text-white">{lang === "en" ? "High Salinity" : "মধ্যম নোনা পানি"}</div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                {lang === "en"
                  ? "Restricted use. Safe for salt-tolerant crops (BRRI dhan67, Sunflower). Risky for traditional Boro."
                  : "সীমিত ব্যবহার। শুধুমাত্র লবণ-সহনশীল ফসলে (ব্রি ৬৭, সূর্যমুখী) ব্যবহার্য। সাধারণ বোরোয় ক্ষতিকর।"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1.5 shadow-sm shadow-rose-950/40">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 font-mono tabular-nums">
                C4: &gt; 3.0 dS/m
              </span>
              <div className="font-bold text-sm text-white">{lang === "en" ? "Very High Salinity" : "তীব্র নোনা পানি"}</div>
              <p className="text-[11px] text-rose-200/80 leading-relaxed">
                {lang === "en"
                  ? "Severe hazard! Unsuitable for freshwater irrigation. Causes crop failure and soil salinization."
                  : "চরম বিপদ! ফসলে এই পানি সেচ দেওয়া সম্পূর্ণ নিষিদ্ধ। জমির মাটি নষ্ট হয়ে যাবে।"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. REPORT AN ISSUE / DISPUTE A READING */}
      <Card className="p-6 bg-[#081320] border-white/15 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {lang === "en" ? "Report a Reading Error or Canal Issue" : "রিডিংয়ে অসঙ্গতি বা খালের সমস্যা জানান"}
          </h3>
        </div>

        {reportSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              {lang === "en"
                ? "Thank you! Your feedback has been recorded and dispatched to Facilitator M. Rahman for a re-check."
                : "ধন্যবাদ! আপনার বার্তাটি নথিভুক্ত করা হয়েছে এবং পানি ফ্যাসিলিটেটরকে পুনঃপরীক্ষার জন্য পাঠানো হয়েছে।"}
            </span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setReportSubmitted(true);
            }}
            className="space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-muted-foreground block mb-1">
                  {lang === "en" ? "Your Name or Village:" : "আপনার নাম বা গ্রাম:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "en" ? "e.g. Karim, Bajua" : "যেমন: করিম, বাজুয়া"}
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1">
                  {lang === "en" ? "Mobile Number (Optional):" : "মোবাইল নম্বর (ঐচ্ছিক):"}
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1">
                {lang === "en" ? "Describe the issue or observation:" : "সমস্যা বা মতামত লিখুন:"}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  lang === "en"
                    ? "e.g., Canal water looks darker than usual, or flap gate seems leaking saline water."
                    : "যেমন: খালের পানি ঘোলা মনে হচ্ছে, অথবা স্লুইস গেটের ফ্ল্যাপ দিয়ে নোনা পানি ঢুকছে।"
                }
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              {lang === "en" ? "Submit to Community Facilitator" : "ফ্যাসিলিটেটরকে পাঠান"}
            </button>
          </form>
        )}
      </Card>

      {/* 5. SERVICE LIMITATIONS & GOVERNANCE */}
      <Card className="p-5 bg-black/40 border border-white/10 rounded-2xl text-xs space-y-2 text-muted-foreground">
        <div className="flex items-center gap-2 font-bold text-white">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{lang === "en" ? "Pilot Service Boundaries & Governance" : "সেবা ব্যবহারের শর্ত ও সীমাবদ্ধতা"}</span>
        </div>
        <p className="leading-relaxed">
          {lang === "en"
            ? "HydroShift AI is an advisory decision support system. It does NOT remotely operate physical sluice gates, pumps, or municipal infrastructure. All gate openings and canal operations remain under the sole authority of local Polder Water Management Committees and the Bangladesh Water Development Board (BWDB)."
            : "HydroShift AI একটি পরামর্শমূলক সিদ্ধান্ত সহায়তা ব্যবস্থা। এটি সরাসরি কোনো স্লুইস গেট বা পাম্প পরিচালনা করে না। গেট খোলা বা বন্ধ করার সিদ্ধান্ত সম্পূর্ণভাবে স্থানীয় পোল্ডার পানি ব্যবস্থাপনা কমিটি এবং পানি উন্নয়ন বোর্ডের (BWDB) দায়িত্বে থাকে।"}
        </p>
      </Card>
    </div>
  );
}
