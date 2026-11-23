"use client";

import React, { useState } from "react";
import { Sun, ShieldCheck, AlertTriangle, ArrowDown, ArrowUp, Layers, Info } from "lucide-react";

export function CapillaryMulchInfographic({ lang = "en" }: { lang?: "en" | "bn" }) {
  const [activeMode, setActiveMode] = useState<"mulched" | "bare">("mulched");

  return (
    <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl overflow-hidden">
      <div className="bezel-core p-5 sm:p-6 rounded-[20px] bg-[#071322] space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                Soil Science Infographic
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <Layers className="w-4 h-4 text-primary" />
              <span>
                {lang === "en"
                  ? "Capillary Salt Dynamics: Bare Soil vs. Rice Straw Mulch"
                  : "মাটির লবণাক্ততা বিজ্ঞান: অনাবৃত জমি বনাম ধানের খড়ের জাবড়া"}
              </span>
            </h3>
          </div>

          {/* Toggle buttons */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveMode("mulched")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMode === "mulched"
                  ? "bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {lang === "en" ? "With Rice Straw Mulch" : "ধানের খড় দেওয়া (নিরাপদ)"}
            </button>
            <button
              onClick={() => setActiveMode("bare")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                activeMode === "bare"
                  ? "bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {lang === "en" ? "Bare Soil (High Salt)" : "অনাবৃত জমি (লবণাক্ত)"}
            </button>
          </div>
        </div>

        {/* Visual Comparison SVG */}
        <div className="rounded-2xl bg-[#030912] border border-white/10 p-3 sm:p-5 relative overflow-hidden">
          <svg viewBox="0 0 600 220" className="w-full h-auto select-none">
            <defs>
              <linearGradient id="sunGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>

              <linearGradient id="moistSoil" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              <linearGradient id="salineGroundwater" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Sun Rays Effect */}
            <circle cx="300" cy="20" r="22" fill="#f59e0b" />
            <circle cx="300" cy="20" r="38" fill="url(#sunGlow)" opacity="0.6" />
            <text x="300" y="55" textAnchor="middle" fill="#fef08a" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
              Intense Dry Season Sun (Mar–Apr 34°C)
            </text>

            {/* Ground Layers */}
            {/* Topsoil: y=90 to y=150 */}
            <rect x="20" y="90" width="560" height="60" fill="url(#moistSoil)" stroke="#334155" strokeWidth="1.5" rx="6" />

            {/* Saline Sub-surface Water Table: y=165 to y=210 */}
            <rect x="20" y="165" width="560" height="45" fill="url(#salineGroundwater)" stroke="#ef4444" strokeWidth="1.5" rx="6" />
            <text x="300" y="192" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="monospace" fontWeight="bold">
              Shallow Saline Groundwater (Tidal Seepage: 8 – 14 dS/m)
            </text>

            {/* Mode-Specific Rendering */}
            {activeMode === "bare" ? (
              <>
                {/* Evaporation Waves Upward */}
                <path d="M 150 85 Q 160 70 150 55" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 300 85 Q 310 70 300 55" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 450 85 Q 460 70 450 55" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3 3" />
                <text x="300" y="75" textAnchor="middle" fill="#f87171" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Rapid Surface Evaporation pulls saline water UP
                </text>

                {/* Capillary Suction Arrows Rising */}
                <line x1="180" y1="160" x2="180" y2="105" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="300" y1="160" x2="300" y2="105" stroke="#ef4444" strokeWidth="2.5" />
                <line x1="420" y1="160" x2="420" y2="105" stroke="#ef4444" strokeWidth="2.5" />

                {/* White Salt Crust on Surface */}
                <rect x="20" y="86" width="560" height="7" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" opacity="0.9" rx="2" />
                <text x="540" y="80" textAnchor="end" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  White Salt Crust (ECe &gt; 12 dS/m)
                </text>
                <text x="300" y="125" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  Dry, Salt-Crusted Root Zone — Seeds Fail to Germinate
                </text>
              </>
            ) : (
              <>
                {/* Golden Rice Straw Mulch Layer on top: y=80 to y=90 */}
                <rect x="20" y="78" width="560" height="13" fill="#ca8a04" stroke="#eab308" strokeWidth="1.5" rx="3" />
                {/* Straw pattern lines */}
                <line x1="40" y1="84" x2="80" y2="84" stroke="#fef08a" strokeWidth="2" />
                <line x1="120" y1="84" x2="180" y2="84" stroke="#fef08a" strokeWidth="2" />
                <line x1="220" y1="84" x2="290" y2="84" stroke="#fef08a" strokeWidth="2" />
                <line x1="340" y1="84" x2="420" y2="84" stroke="#fef08a" strokeWidth="2" />
                <line x1="460" y1="84" x2="540" y2="84" stroke="#fef08a" strokeWidth="2" />

                {/* Reflected Heat Arrows */}
                <path d="M 280 65 Q 300 75 320 65" fill="none" stroke="#ca8a04" strokeWidth="2" />
                <text x="300" y="70" textAnchor="middle" fill="#fef08a" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Rice Straw Mulch Barrier Blocks Sun &amp; Traps Moisture
                </text>

                {/* Downward Moisture Preservation Arrows */}
                <line x1="200" y1="105" x2="200" y2="135" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="300" y1="105" x2="300" y2="135" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="400" y1="105" x2="400" y2="135" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

                <text x="300" y="125" textAnchor="middle" fill="#34d399" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                  Moist Topsoil Preserved — Salt Stays Down in Deep Aquifer
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Explanatory Takeaway Card */}
        <div className={`p-4 rounded-2xl border ${
          activeMode === "mulched"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
            : "bg-rose-500/10 border-rose-500/30 text-rose-200"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            {activeMode === "mulched" ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {activeMode === "mulched"
                ? (lang === "en" ? "Scientific Takeaway: Mulching Traps Moisture" : "বৈজ্ঞানিক ব্যাখ্যা: খড়ের জাবড়া আর্দ্রতা রক্ষা করে")
                : (lang === "en" ? "Hazard: Capillary Suction Concentrates Salt" : "বিপদ: প্রস্বেদন বাষ্পীভবনে লবণ উঠে আসে")}
            </h4>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {activeMode === "mulched"
              ? (lang === "en"
                  ? "Applying 5–6 tons/ha of dried rice straw mulch right after Aman harvest shields the clay topsoil from direct solar radiation. This reduces surface evaporation by up to 60%, preventing the capillary upward draw of saline shallow groundwater. Mungbean and sunflower seeds can be dibbled directly into the moist soil without tilling."
                  : "আমন ধান কাটার পরপরই জমিতে ধানের খড় বিছিয়ে দিলে মাটির ওপর সরাসরি রোদ পড়তে পারে না। এতে বাষ্পীভবন ৬০% হ্রাস পায় এবং নিচের লবণাক্ত পানি ওপরে উঠে আসা বন্ধ থাকে। ফলে জমি না চাষেই জাবড়ার মধ্যে মুগডাল বা সূর্যমুখীর বীজ রোপণ করা সম্ভব হয়।")
              : (lang === "en"
                  ? "When land is left fallow and unmulched after November, intense tropical sunlight heats the bare soil. Rapid evaporation acts like an underground suction pump, pulling saline groundwater (8–14 dS/m) straight to the root zone. As water evaporates into the air, pure white salt precipitates on the topsoil, causing complete crop failure."
                  : "ধান কাটার পর জমি ফাঁকা ফেলে রাখলে প্রখর রোদে মাটি শুকিয়ে যায়। তখন মাটির নিচের নোনা পানি বাষ্পীভবনের টানে কৈশিক প্রক্রিয়ায় ওপরে উঠে আসে এবং পানি বাষ্পীভূত হয়ে জমির উপরিভাগে লবণের সাদা স্তর তৈরি করে জমিকে বিষাক্ত করে ফেলে।")}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CapillaryMulchInfographic;
