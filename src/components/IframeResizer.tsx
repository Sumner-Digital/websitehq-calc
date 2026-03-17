"use client";

import { useEffect } from "react";

export default function IframeResizer() {
  useEffect(() => {
    function sendHeight() {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "roi-calc-resize", height }, "*");
    }

    // Send initial height
    sendHeight();

    // Re-send on resize and DOM changes
    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);

    window.addEventListener("resize", sendHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", sendHeight);
    };
  }, []);

  return null;
}
