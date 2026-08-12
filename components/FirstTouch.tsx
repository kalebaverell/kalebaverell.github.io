"use client";
// Mount-once capture of first-touch attribution. All logic (and the rules
// it must keep) lives in lib/firstTouch.ts. Renders nothing.
import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/firstTouch";

export default function FirstTouch() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
