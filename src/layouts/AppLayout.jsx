import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import MobileNavbar from "@/components/layout/MobileNavbar";
import SearchModal from "@/components/common/SearchModal";
import { useRealtime } from "@/hooks/useRealtime";

export default function AppLayout() {
  useRealtime();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Sidebar — desktop only */}
      <Sidebar onSearchOpen={() => setSearchOpen(true)} />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Outlet context={{ openSearch: () => setSearchOpen(true) }} />
        </div>

        {/* Mobile bottom nav */}
        <MobileNavbar onSearchOpen={() => setSearchOpen(true)} />
      </main>

      {/* Global search modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
