"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlertItem {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  entity: string;
  entity_name: string;
  timestamp: string;
  message: string;
  status: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
    fetch(`${API_URL}/api/v1/reaches/alerts/all`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAlerts(data))
      .catch((err) => {
        console.error("Failed to fetch alerts", err);
        setAlerts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Active Alerts</h1>
        <p className="text-sm text-muted-foreground">System-generated warnings for threshold breaches and data source failures across Khulna reaches.</p>
      </div>

      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between">
        <span>
          <strong>Advisory Uncertainty Notice:</strong> Alerts incorporate 95% Confidence Intervals from the 5-model deep ensemble. Predictions represent research prototypes; verify with local sensors before operating municipal intake valves.
        </span>
        <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-[10px] shrink-0 ml-3">
          ENSEMBLE UNCERTAINTY ACTIVE
        </Badge>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/20 border-b border-border">
              <tr>
                <th className="px-5 py-4 font-medium">Severity</th>
                <th className="px-5 py-4 font-medium">Timestamp</th>
                <th className="px-5 py-4 font-medium">Entity / Reach</th>
                <th className="px-5 py-4 font-medium">Message</th>
                <th className="px-5 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {alerts.map((alert) => {
                const isCrit = alert.severity === "CRITICAL";
                const isWarn = alert.severity === "WARNING";

                return (
                  <tr 
                    key={alert.id}
                    className={`transition-colors ${
                      isCrit 
                        ? "hover:bg-destructive/10 bg-destructive/5 border-l-2 border-l-destructive" 
                        : isWarn 
                        ? "hover:bg-warning/10 bg-warning/5 border-l-2 border-l-warning" 
                        : "hover:bg-white/5 opacity-80"
                    }`}
                  >
                    <td className="px-5 py-4">
                      <Badge 
                        variant="outline" 
                        className={
                          isCrit 
                            ? "bg-destructive/20 text-destructive border-destructive/30" 
                            : isWarn 
                            ? "bg-warning/20 text-warning border-warning/30" 
                            : "bg-muted text-muted-foreground border-none"
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs font-mono">
                      {alert.timestamp.includes("T") ? new Date(alert.timestamp).toLocaleDateString() : alert.timestamp}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-foreground">{alert.entity_name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{alert.entity}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-sm text-foreground/90">
                      {alert.message}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${
                        isCrit ? "text-destructive" : isWarn ? "text-warning" : "text-emerald-400"
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">
                    No active threshold alerts. Backend may be offline or all reaches are within nominal thresholds.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
