"use client";
import { useIrreverso } from "@/lib/store";

export default function EdgeMenu() {
  const { menuOpen, setMenuOpen } = useIrreverso();

  return (
    <>
      <div
        className="edgeTrigger"
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
        onTouchStart={() => setMenuOpen(!menuOpen)}
        aria-label="Edge Menu Trigger"
      />
      <nav className={menuOpen ? "edgeMenu open" : "edgeMenu"} onMouseLeave={() => setMenuOpen(false)}>
        <a href="/core/archive">ARCHIVE</a>
        <a href="/core/summary">SUMMARY</a>
        <a href="/core/future-news">FUTURE NEWS</a>
        <div className="edgeDivider" />
        <a className="edgeDisabled" aria-disabled="true">AI FEATURES</a>
        <a className="edgeDisabled" aria-disabled="true">PROTOCOLS</a>
        <a className="edgeDisabled" aria-disabled="true">SIGNALS</a>
        <a className="edgeDisabled" aria-disabled="true">MEMBERS</a>
      </nav>
    </>
  );
}
