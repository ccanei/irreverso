"use client";
import { useEffect, useMemo, useRef } from "react";
import { useIrreverso } from "@/lib/store";

function rangeYears(start: number, end: number) {
  const arr: number[] = [];
  for (let y = start; y <= end; y++) arr.push(y);
  return arr;
}

export default function Timeline() {
  const now = new Date().getFullYear();
  const { year, setYear, markVisited } = useIrreverso();
  const years = useMemo(() => rangeYears(1983, 2107), []);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setYear(now);
    markVisited(now);
    requestAnimationFrame(() => centerYear(now));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const centerYear = (y: number) => {
    const el = scroller.current;
    if (!el) return;
    const item = el.querySelector<HTMLButtonElement>(`button[data-year="${y}"]`);
    if (!item) return;
    const left = item.offsetLeft + item.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollTo({ left, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let t: number | undefined;

    const onScroll = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        let bestY = year;
        let bestDist = Infinity;

        const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>("button[data-year]"));
        for (const b of buttons) {
          const bx = b.offsetLeft + b.offsetWidth / 2;
          const d = Math.abs(bx - center);
          if (d < bestDist) {
            bestDist = d;
            bestY = Number(b.dataset.year);
          }
        }

        setYear(bestY);
        markVisited(bestY);
        centerYear(bestY);
      }, 120);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, [year, setYear, markVisited]);

  return (
    <div className="timelineWrap">
      <div ref={scroller} className="timelineScroller" aria-label="Timeline IRREVERSO">
        {years.map((y) => (
          <button
            key={y}
            data-year={y}
            className={y === year ? "yearBtn active" : "yearBtn"}
            onClick={() => {
              setYear(y);
              markVisited(y);
              centerYear(y);
            }}
          >
            {y}
          </button>
        ))}
        <div className="ghostTail" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      </div>
    </div>
  );
}
