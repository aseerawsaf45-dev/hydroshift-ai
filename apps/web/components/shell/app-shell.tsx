"use client";

import { useState } from "react";
import { SidebarNav, MobileNavDrawer } from "./sidebar-nav";
import { TopContextBar } from "./top-context-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-[#060b13] text-foreground dark selection:bg-primary/25">
      {/* Desktop Sidebar */}
      <SidebarNav />

      {/* Mobile Drawer */}
      <MobileNavDrawer 
        open={mobileNavOpen} 
        onClose={() => setMobileNavOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopContextBar onToggleMobileNav={() => setMobileNavOpen(true)} />
        
        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 min-h-0 relative z-10 scrollbar-thin">
          <div className="mx-auto max-w-[1640px] w-full h-full pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
