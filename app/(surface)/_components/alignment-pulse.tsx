"use client";

import { useEffect } from "react";
import { updateAlignment } from "../../../lib/alignment";
import { addEvent } from "../../../lib/presence";

export function AlignmentPulse() {
  useEffect(() => {
    const updated = updateAlignment();
    if (updated.changedPhase) {
      addEvent(`alignment_phase_${updated.phase}`);
    }
  }, []);

  return null;
}
