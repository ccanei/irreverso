"use client";
import CanonSearch from "./CanonSearch";

export default function TopBar() {
  return (
    <header className="topBar">
      <div className="topLeft">
        <div className="nuveMini" aria-hidden="true" />
      </div>
      <div className="topRight">
        <CanonSearch />
      </div>
    </header>
  );
}
