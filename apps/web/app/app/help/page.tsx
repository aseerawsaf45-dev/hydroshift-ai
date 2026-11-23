"use client";

import { useState } from "react";
import Link from "next/link";
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
import { SalinitySpectrumInfographic } from "@/components/infographics/SalinitySpectrumInfographic";

export default function HelpPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  return (
    <div className="w-full max-w-[1520px] mx-auto min-w-0 space-y-6 p-2 sm:p-4 lg:p-6">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium text-secondary">
              Community service &amp; support
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Dacope polder assistance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <span>{lang === "en" ? "Help, Contacts & Water Guide" : "সহায়তা, যোগাযোগ ও পানির নির্দেশিকা"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl [text-wrap:pretty]">
            {lang === "en"
              ? "Contact your local community water facilitator in Dacope, understand salinity classes, and report field issues."
              : "দাকোপের স্থানীয় পানি ফ্যাসিলিটেটরের সাথে যোগাযোগ, লবণাক্ততার শ্রেণিবিভাগ নির্দেশিকা এবং সমস্যা রিপোর্ট করার মাধ্যম।"}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-0.5 flex items-center text-xs self-start sm:self-center">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              lang === "en" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLang("bn")}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              lang === "bn" ? "bg-white/15 text-white" : "text-muted-foreground hover:text-white"
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>

      {/* 2. LOCAL COMMUNITY FACILITATOR CONTACT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold text-white">
                {lang === "en" ? "Dacope water facilitator" : "দাকোপ পানি ফ্যাসিলিটেটর"}
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono">
              {lang === "en" ? "Active in field" : "মাঠে কর্মরত"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-base font-semibold text-white">Md. Mokhlesur Rahman (রহমান)</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              {lang === "en"
                ? "Community EC meter custodian & water monitor (Polder 31 & 32)"
                : "কমিউনিটি ইসি মিটার তত্ত্বাবধায়ক ও পানি পর্যবেক্ষক (পোল্ডার ৩১ ও ৩২)"}
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <a
                href="tel:+8801712345678"
                className="btn-tactile inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 font-medium text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Call: +880 1712-345678</span>
              </a>
              <a
                href="https://wa.me/8801712345678"
                target="_blank"
                rel="noreferrer"
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-muted-foreground hover:text-white border border-white/10 text-xs font-medium transition-colors"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{lang === "en" ? "Available daily: 07:00 AM – 06:00 PM" : "দৈনিক সময়: সকাল ৭:০০ – সন্ধ্যা ৬:০০"}</span>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>{lang === "en" ? "Stationed at Bajua Union Council, Dacope" : "বাজুয়া ইউনিয়ন পরিষদ কমপ্লেক্স, দাকোপ"}</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-semibold text-white">
                {lang === "en" ? "Agricultural Extension (DAE)" : "উপজেলা কৃষি সম্প্রসারণ অধিদপ্তর"}
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/10 text-muted-foreground font-mono">
              Govt liaison
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="text-base font-semibold text-white">Sub-Assistant Agriculture Officer (SAAO)</div>
            <div className="text-muted-foreground text-xs leading-relaxed">
              {lang === "en"
                ? "Department of Agricultural Extension (DAE), Dacope Upazila, Khulna"
                : "কৃষি সম্প্রসারণ অধিদপ্তর, দাকোপ উপজেলা, খুলনা"}
            </div>
            <div className="pt-2 text-white font-mono text-xs flex items-center gap-2">
              <span className="text-muted-foreground">Office hotline:</span>
              <a href="tel:+88041762340" className="hover:underline text-primary font-medium">
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

      {/* 3. UNDERSTANDING WATER SALINITY CLASSES (C1 - C4) */}
      <SalinitySpectrumInfographic lang={lang} />

      {/* 4. REPORT AN ISSUE / DISPUTE A READING */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#121824] border border-white/10 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/10">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-white">
            {lang === "en" ? "Report a reading error or canal issue" : "রিডিংয়ে অসঙ্গতি বা খালের সমস্যা জানান"}
          </h3>
        </div>

        {reportSubmitted ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center gap-3">
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
                <label className="text-muted-foreground block mb-1 font-medium">
                  {lang === "en" ? "Your name or village:" : "আপনার নাম বা গ্রাম:"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "en" ? "e.g. Karim, Bajua" : "যেমন: করিম, বাজুয়া"}
                  className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-muted-foreground block mb-1 font-medium">
                  {lang === "en" ? "Mobile number (optional):" : "মোবাইল নম্বর (ঐচ্ছিক):"}
                </label>
                <input
                  type="tel"
                  placeholder="017xxxxxxxx"
                  className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-muted-foreground block mb-1 font-medium">
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
                className="w-full bg-black/30 border border-white/15 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              className="btn-tactile px-5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 font-medium text-xs transition-colors"
            >
              {lang === "en" ? "Submit to community facilitator" : "ফ্যাসিলিটেটরকে পাঠান"}
            </button>
          </form>
        )}
      </div>

      {/* 5. SERVICE LIMITATIONS & GOVERNANCE */}
      <div className="p-5 rounded-xl bg-black/30 border border-white/10 text-xs space-y-2 text-muted-foreground">
        <div className="flex items-center gap-2 font-medium text-white">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{lang === "en" ? "Pilot service boundaries & governance" : "সেবা ব্যবহারের শর্ত ও সীমাবদ্ধতা"}</span>
        </div>
        <p className="leading-relaxed [text-wrap:pretty]">
          {lang === "en"
            ? "HydroShift AI is an advisory decision support system. It does NOT remotely operate physical sluice gates, pumps, or municipal infrastructure. All gate openings and canal operations remain under the sole authority of local Polder Water Management Committees and the Bangladesh Water Development Board (BWDB)."
            : "HydroShift AI একটি পরামর্শমূলক সিদ্ধান্ত সহায়তা ব্যবস্থা। এটি সরাসরি কোনো স্লুইস গেট বা পাম্প পরিচালনা করে না। গেট খোলা বা বন্ধ করার সিদ্ধান্ত সম্পূর্ণভাবে স্থানীয় পোল্ডার পানি ব্যবস্থাপনা কমিটি এবং পানি উন্নয়ন বোর্ডের (BWDB) দায়িত্বে থাকে।"}
        </p>
      </div>
    </div>
  );
}
