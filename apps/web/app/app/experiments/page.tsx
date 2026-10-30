"use client";

import { useSyncExternalStore } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";

interface CustomExperiment {
  id: string;
  number: string;
  title: string;
  target: string;
  reachName: string;
  reachId: string;
  modelType: string;
  horizon: string;
  status: string;
  mae: string;
  duration: string;
  learnedVelocity: string;
  learnedDispersion: string;
  pdeResidual: string;
  createdAt: string;
}

const emptyCustomExperiments: CustomExperiment[] = [];
let cachedRaw: string | null = null;
let cachedParsed: CustomExperiment[] = emptyCustomExperiments;

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredExperiments(): CustomExperiment[] {
  if (typeof window === "undefined") return emptyCustomExperiments;
  try {
    const raw = localStorage.getItem("khulna_custom_experiments");
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    cachedParsed = raw ? JSON.parse(raw) : emptyCustomExperiments;
    return cachedParsed;
  } catch {
    return emptyCustomExperiments;
  }
}

function getServerStoredExperiments(): CustomExperiment[] {
  return emptyCustomExperiments;
}

export default function ExperimentsPage() {
  const customExperiments = useSyncExternalStore(
    subscribeToStorage,
    getStoredExperiments,
    getServerStoredExperiments
  );

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Model Experiments</h1>
            <Badge variant="outline" className="border-sky-500/30 text-sky-400 bg-sky-500/10 font-mono text-[10px]">
              {3 + customExperiments.length} RUNS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Historical training runs, hyperparameter sweeps, and ablation studies for the Physics-Informed Neural Network (PINN).
          </p>
        </div>

        <Link
          href="/app/experiments/new"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Experiment Run</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Custom Trained Runs */}
        {customExperiments.map((exp) => (
          <Card
            key={exp.id}
            className="bg-card border-emerald-500/30 bg-emerald-500/[0.03] p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-lg"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">{exp.title}</h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                  NEW RUN &bull; {exp.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Target: <strong className="text-slate-200">{exp.target}</strong> &bull; Horizon:{" "}
                <strong className="text-slate-200">{exp.horizon}</strong> &bull; v={exp.learnedVelocity}, D={exp.learnedDispersion} &bull; Created at {exp.createdAt}
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end space-y-1">
              <span className="text-sm font-bold text-emerald-400 font-mono">MAE: {exp.mae}</span>
              <span className="text-xs text-muted-foreground font-mono">Duration: {exp.duration}</span>
            </div>
          </Card>
        ))}

        {/* Historical Benchmark 1 */}
        <Card className="bg-card border-white/10 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 shadow-md">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">Experiment #042: Fourier Mapping Baseline</h3>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 font-mono text-[10px]">
                COMPLETED
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Tested impact of high-frequency tidal embeddings (M2, S2 harmonics) on reconstruction loss.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-bold text-primary font-mono">MAE: 0.435 dS/m (Verified)</span>
            <span className="text-xs text-muted-foreground font-mono">Duration: 4h 12m</span>
          </div>
        </Card>

        {/* Historical Benchmark 2 */}
        <Card className="bg-card border-white/10 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 opacity-75 shadow-md">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">Experiment #041: Default PINN</h3>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-none font-mono text-[10px]">
                COMPLETED
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Standard PINN without Random Fourier features.</p>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-bold text-muted-foreground font-mono">MAE: 0.812 dS/m</span>
            <span className="text-xs text-muted-foreground font-mono">Duration: 3h 45m</span>
          </div>
        </Card>

        {/* Historical Benchmark 3 */}
        <Card className="bg-card border-white/10 p-5 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 opacity-60 shadow-md">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">Experiment #040: Persistence Baseline</h3>
              <Badge variant="outline" className="bg-muted text-muted-foreground border-none font-mono text-[10px]">
                COMPLETED
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Naive historical copy-forward baseline (u(t) = u(t-1)).</p>
          </div>

          <div className="flex flex-col items-start md:items-end space-y-1">
            <span className="text-sm font-bold text-muted-foreground font-mono">MAE: 0.660 dS/m</span>
            <span className="text-xs text-muted-foreground font-mono">Duration: 0h 1m</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
