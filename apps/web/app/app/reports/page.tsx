import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const reports = [
    {
      id: "REP-2026-10A",
      title: "Khulna Pre-Monsoon Salinity Survey",
      date: "Oct 1, 2026",
      status: "Finalized",
      type: "Seasonal Assessment",
      size: "2.4 MB",
      gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
      id: "REP-2026-09B",
      title: "SWOT KaRIn Validation vs. Ground Truth",
      date: "Sep 15, 2026",
      status: "Published",
      type: "Technical Validation",
      size: "4.1 MB",
      gradient: "from-purple-500/20 to-pink-500/10",
    },
    {
      id: "REP-2026-08C",
      title: "Agricultural Impact Assessment: Dacope",
      date: "Aug 28, 2026",
      status: "Draft",
      type: "Impact Analysis",
      size: "1.8 MB",
      gradient: "from-emerald-500/20 to-teal-500/10",
    }
  ];

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/15 shadow-2xl">
        <div className="bezel-core p-6 rounded-[20px] bg-[#081320] flex flex-col space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Intelligence Reports &amp; Exports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Curated analytics, seasonal assessments, and technical validations derived from the HydroShift AI pipeline. Export ready for institutional stakeholders and agricultural researchers.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="bezel-shell p-1 rounded-3xl bg-white/[0.04] border border-white/10 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer group"
          >
            <div className="bezel-core p-6 rounded-[20px] bg-[#081320] flex flex-col justify-between min-h-[220px] relative overflow-hidden h-full">
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${report.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
              
              <div className="relative z-10 flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-black/40 text-[10px] font-mono border-white/10 backdrop-blur-md">
                    {report.id}
                  </Badge>
                  <Badge variant={report.status === 'Draft' ? 'secondary' : 'default'} className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono font-bold">
                    {report.status}
                  </Badge>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <h3 className="font-bold text-base leading-tight group-hover:text-white transition-colors duration-300">
                    {report.title}
                  </h3>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-1 font-mono">
                    {report.type}
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/5 mt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">{report.date}</span>
                  <span className="text-[11px] text-muted-foreground opacity-70 font-mono tabular-nums">{report.size} • PDF</span>
                </div>
                
                <button className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300 transform group-hover:scale-105 shadow-md">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Action Area */}
      <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Need a custom temporal extraction? 
        </p>
        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm font-medium transition-all duration-300">
          Request Custom Report
        </button>
      </div>

    </div>
  );
}
