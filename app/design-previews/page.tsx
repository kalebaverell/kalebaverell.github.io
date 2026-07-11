"use client";
// The design-preview chooser lives in public/design-previews/index.html (plain
// static files so each direction is a self-contained page). Next only serves
// public/ files at exact paths, so this route catches /design-previews and
// forwards to the chooser.
import { useEffect } from "react";

export default function DesignPreviewsRedirect() {
  useEffect(() => {
    window.location.replace("/design-previews/index.html");
  }, []);
  return (
    <p style={{ padding: 40, fontSize: 15 }}>
      Opening the design previews… if nothing happens,{" "}
      <a href="/design-previews/index.html">click here</a>.
    </p>
  );
}
