"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Droplets,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  ClipboardList,
  AlertCircle,
  FileSpreadsheet,
  PlusCircle,
  Save,
  Check,
  ChevronRight,
  Send,
} from "lucide-react";

interface MeasurementRecord {
  id: string;
  sourceName: string;
  timestamp: string;
  ecValue: number;
  temperatureC: number;
  cClass: string;
  meterCalibrationPassed: boolean;
  clarity: "Clear" | "Slightly Turbid" | "Heavy Silt";
  reviewerStatus: "VERIFIED" | "PENDING_REVIEW";
  notes: string;
}

interface FarmerFollowUp {
  id: string;
  farmerCode: string;
  village: string;
  cropSelected: string;
  adviceGiven: string;
  actionTaken: "Followed Advice" | "Delayed Action" | "Irrigated Anyway" | "Constrained by Canal Silt";
  outcomeNotes: string;
  timestamp: string;
}

export default function FacilitatorPage() {
  const [activeTab, setActiveTab] = useState<"measurement" | "followup">("measurement");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Field form state
  const [sourceId, setSourceId] = useState("dacope-bajua-canal");
  const [ecInput, setEcInput] = useState<string>("1.8");
  const [tempInput, setTempInput] = useState<string>("25.0");
  const [meterChecked, setMeterChecked] = useState(true);
  const [clarityInput, setClarityInput] = useState<"Clear" | "Slightly Turbid" | "Heavy Silt">("Clear");
  const [fieldNotes, setFieldNotes] = useState("");

  // Follow-up form state
  const [farmerVillage, setFarmerVillage] = useState("Bajua");
  const [cropAdvised, setCropAdvised] = useState("Sunflower BARI-2");
  const [adviceGiven, setAdviceGiven] = useState("Safe to sow within 36h before spring tide");
  const [actionTaken, setActionTaken] = useState<"Followed Advice" | "Delayed Action" | "Irrigated Anyway" | "Constrained by Canal Silt">("Followed Advice");
  const [outcomeNotes, setOutcomeNotes] = useState("");
  const [followupSuccess, setFollowupSuccess] = useState(false);

  const [records, setRecords] = useState<MeasurementRecord[]>([
    {
      id: "REC-101",
      sourceName: "Bajua Main Irrigation Canal",
      timestamp: "Today at 08:30 AM",
      ecValue: 1.8,
      temperatureC: 25.1,
      cClass: "C3",
      meterCalibrationPassed: true,
      clarity: "Clear",
      reviewerStatus: "VERIFIED",
      notes: "Ebb tide receding. Flap gate sealing properly.",
    },
    {
      id: "REC-100",
      sourceName: "Pankhali Freshwater Khari",
      timestamp: "Today at 07:15 AM",
      ecValue: 0.95,
      temperatureC: 24.8,
      cClass: "C2",
      meterCalibrationPassed: true,
      clarity: "Clear",
      reviewerStatus: "VERIFIED",
      notes: "Pond level good. Seedbeds active.",
    },
    {
      id: "REC-099",
      sourceName: "Kamarkhola Sluice Outfall",
      timestamp: "Yesterday at 05:00 PM",
      ecValue: 4.8,
      temperatureC: 25.5,
      cClass: "C4",
      meterCalibrationPassed: true,
      clarity: "Slightly Turbid",
      reviewerStatus: "VERIFIED",
      notes: "Passur high tide penetration. Gate locked.",
    },
  ]);

  const [followups, setFollowups] = useState<FarmerFollowUp[]>([
    {
      id: "FOL-041",
      farmerCode: "F-Bajua-012",
      village: "Bajua",
      cropSelected: "Sunflower BARI-2",
      adviceGiven: "Sowed seedbed early. Irrigated from canal before salt rise.",
      actionTaken: "Followed Advice",
      outcomeNotes: "Seedling emergence 92%. Seedbed healthy.",
      timestamp: "Yesterday",
    },
    {
      id: "FOL-040",
      farmerCode: "F-Pankhali-008",
      village: "Pankhali",
      cropSelected: "BRRI dhan67",
      adviceGiven: "Advised against direct river water. Directed to community pond.",
      actionTaken: "Followed Advice",
      outcomeNotes: "Saved nursery from 4.8 dS/m shock.",
      timestamp: "2 days ago",
    },
  ]);

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const ecNum = parseFloat(ecInput);
    if (isNaN(ecNum) || ecNum <= 0) return;

    let cClass = "C1";
    if (ecNum >= 3.0) cClass = "C4";
    else if (ecNum >= 1.5) cClass = "C3";
    else if (ecNum >= 0.75) cClass = "C2";

    const newRec: MeasurementRecord = {
      id: `REC-${records.length + 101}`,
      sourceName:
        sourceId === "dacope-bajua-canal"
          ? "Bajua Main Irrigation Canal"
          : sourceId === "dacope-pankhali-khari"
          ? "Pankhali Freshwater Retention Khari"
          : "Kamarkhola Sluice Outfall Canal",
      timestamp: "Just now (Submitted)",
      ecValue: Number(ecNum.toFixed(2)),
      temperatureC: parseFloat(tempInput) || 25.0,
      cClass,
      meterCalibrationPassed: meterChecked,
      clarity: clarityInput,
      reviewerStatus: "VERIFIED",
      notes: fieldNotes || "Routine field measurement logged.",
    };

    setRecords([newRec, ...records]);
    setSubmitSuccess(true);
    setFieldNotes("");
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handleSaveFollowup = (e: React.FormEvent) => {
    e.preventDefault();
    const newFol: FarmerFollowUp = {
      id: `FOL-0${followups.length + 42}`,
      farmerCode: `F-${farmerVillage}-${Math.floor(10 + Math.random() * 90)}`,
      village: farmerVillage,
      cropSelected: cropAdvised,
      adviceGiven,
      actionTaken,
      outcomeNotes: outcomeNotes || "No adverse events reported.",
      timestamp: "Just now",
    };

    setFollowups([newFol, ...followups]);
    setFollowupSuccess(true);
    setOutcomeNotes("");
    setTimeout(() => setFollowupSuccess(false), 4000);
  };

  return (
    <div className="min-h-[100dvh] bg-[#05070d] text-foreground p-3 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="outline" className="text-[11px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              Facilitator Portal // মাঠ পর্যায়ের সেবা পোর্টাল
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            <span>Field Measurement & Community Follow-up</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            For Dacope community water facilitators to submit verified EC meter readings and record farmer advisory follow-up.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-1 flex items-center text-xs self-start sm:self-center">
          <button
            onClick={() => setActiveTab("measurement")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "measurement" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
            }`}
          >
            Log Measurement
          </button>
          <button
            onClick={() => setActiveTab("followup")}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "followup" ? "bg-primary text-black font-bold shadow" : "text-muted-foreground hover:text-white"
            }`}
          >
            Farmer Follow-up
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: LOG FIELD MEASUREMENT */}
      {/* ===================================================================== */}
      {activeTab === "measurement" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Measurement Form (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
              <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-primary" />
                    <span>New Field EC Reading</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Dacope Meter #03</span>
                </div>

                {submitSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Reading verified and published to "My Water" instantly!</span>
                  </div>
                )}

                <form onSubmit={handleSaveMeasurement} className="space-y-3.5 text-xs">
                  {/* Source Selection */}
                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Water Source / Sampling Point:</label>
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="dacope-bajua-canal">Bajua Main Irrigation Canal (Polder 31)</option>
                      <option value="dacope-pankhali-khari">Pankhali Freshwater Retention Khari (Polder 31)</option>
                      <option value="dacope-kamarkhola-sluice">Kamarkhola Sluice Outfall Canal (Polder 32)</option>
                    </select>
                  </div>

                  {/* EC Reading and Temperature */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground block mb-1 font-medium">
                        EC Reading (<span className="text-primary font-bold">dS/m</span>):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={ecInput}
                        onChange={(e) => setEcInput(e.target.value)}
                        placeholder="e.g. 1.80"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground block mb-1 font-medium">
                        Water Temp (°C):
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={tempInput}
                        onChange={(e) => setTempInput(e.target.value)}
                        placeholder="25.0"
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-primary tabular-nums transition-colors"
                      />
                    </div>
                  </div>

                  {/* Meter Check & Quality Controls */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Meter Zero &amp; Calibration Check:</span>
                      <input
                        type="checkbox"
                        checked={meterChecked}
                        onChange={(e) => setMeterChecked(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded cursor-pointer"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Confirmed calibrated with standard 1.413 dS/m KCl solution this week.
                    </span>
                  </div>

                  {/* Water Appearance */}
                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Water Appearance / Turbidity:</label>
                    <select
                      value={clarityInput}
                      onChange={(e: any) => setClarityInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="Clear">Clear / Transparent (পরিষ্কার)</option>
                      <option value="Slightly Turbid">Slightly Turbid / Grey (হালকা ঘোলা)</option>
                      <option value="Heavy Silt">Heavy Silt / Dark Clay (কাদাযুক্ত)</option>
                    </select>
                  </div>

                  {/* Field Notes */}
                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Field Observations / Flap Gate Status:</label>
                    <textarea
                      rows={2}
                      value={fieldNotes}
                      onChange={(e) => setFieldNotes(e.target.value)}
                      placeholder="e.g. Sluice flap tightly seated. Low tide outflow clear."
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01]"
                  >
                    <Save className="w-4 h-4" />
                    <span>Verify &amp; Submit Measurement</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Live Log of Field Records (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span>Recent Field Measurements (Dacope Pilot)</span>
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">{records.length} Recorded</span>
            </div>

            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="bezel-shell p-1 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg">
                  <div className="bezel-core p-4 rounded-[14px] bg-[#081320] space-y-2">
                    <div className="flex items-center justify-between text-xs pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{r.sourceName}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({r.id})</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono">
                        {r.reviewerStatus}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black font-mono text-white tabular-nums">{r.ecValue}</span>
                        <span className="font-mono text-primary font-bold">dS/m</span>
                        <span className="text-[11px] text-muted-foreground">({r.cClass} Class)</span>
                      </div>

                      <div className="text-right text-[11px] text-muted-foreground font-mono">
                        <span>{r.timestamp}</span>
                        <span className="block text-[10px] text-emerald-400">Temp: <span className="tabular-nums">{r.temperatureC}</span>°C</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground pt-1 border-t border-white/5 leading-relaxed">
                      {r.notes} • Clarity: {r.clarity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: FARMER FOLLOW-UP LOG */}
      {/* ===================================================================== */}
      {activeTab === "followup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 shadow-2xl">
              <div className="bezel-core p-5 rounded-[20px] bg-[#081320] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    <span>Log Farmer Response</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Closed Feedback Loop</span>
                </div>

                {followupSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Follow-up response successfully archived!</span>
                  </div>
                )}

                <form onSubmit={handleSaveFollowup} className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Village:</label>
                    <select
                      value={farmerVillage}
                      onChange={(e) => setFarmerVillage(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="Bajua">Bajua (বাজুয়া)</option>
                      <option value="Pankhali">Pankhali (পানখালী)</option>
                      <option value="Kamarkhola">Kamarkhola (কামারখোলা)</option>
                      <option value="Sutarkhali">Sutarkhali (সুতারখালী)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Intended Crop / Variety:</label>
                    <input
                      type="text"
                      value={cropAdvised}
                      onChange={(e) => setCropAdvised(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Advisory Delivered to Farmer:</label>
                    <input
                      type="text"
                      value={adviceGiven}
                      onChange={(e) => setAdviceGiven(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Action Actually Taken by Farmer:</label>
                    <select
                      value={actionTaken}
                      onChange={(e: any) => setActionTaken(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    >
                      <option value="Followed Advice">Followed Advice (পরামর্শ মেনে কাজ করেছেন)</option>
                      <option value="Delayed Action">Delayed Action (বপন পিছিয়ে দিয়েছেন)</option>
                      <option value="Irrigated Anyway">Irrigated Anyway (ঝুঁকি নিয়ে সেচ দিয়েছেন)</option>
                      <option value="Constrained by Canal Silt">Constrained by Canal Silt (খালে পানি না থাকায় পারেননি)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-muted-foreground block mb-1 font-medium">Farmer Feedback / Outcome Notes:</label>
                    <textarea
                      rows={2}
                      value={outcomeNotes}
                      onChange={(e) => setOutcomeNotes(e.target.value)}
                      placeholder="e.g. Farmer pleased with seedling vigor; avoided water during spring tide."
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.01]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Record Farmer Follow-up</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Follow-up List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              <span>Community Feedback Records ({followups.length})</span>
            </h3>

            <div className="space-y-3">
              {followups.map((f) => (
                <div key={f.id} className="bezel-shell p-1 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg">
                  <div className="bezel-core p-4 rounded-[14px] bg-[#081320] space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                      <span className="font-bold text-white">
                        {f.farmerCode} ({f.village}) • {f.cropSelected}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono ${
                          f.actionTaken === "Followed Advice"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {f.actionTaken}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      <span className="font-semibold text-white">Advice: </span>
                      {f.adviceGiven}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      <span className="font-semibold text-white">Outcome: </span>
                      {f.outcomeNotes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
