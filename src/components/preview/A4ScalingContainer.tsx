"use client";

import { useEffect, useRef, forwardRef, type ReactNode } from "react";

// A4 dimensions in mm
const A4_W_MM = 210;
const A4_H_MM = 297;
const PX_PER_MM = 3;
const A4_W_PX = A4_W_MM * PX_PER_MM;  // 630px
const A4_H_PX = A4_H_MM * PX_PER_MM;  // 891px

/**
 * A4ScalingContainer — wraps resume content in a container that
 * exactly mimics A4 paper (210mm × 297mm) and scales to fit the
 * available viewport width using CSS transform: scale().
 *
 * Uses direct DOM manipulation to avoid React re-renders on resize.
 * Forwards a ref to the inner A4-sized div so the PDF exporter can
 * target it for PDF export.
 */
export const A4ScalingContainer = forwardRef<HTMLDivElement, { children: ReactNode }>(
  function A4ScalingContainer({ children }, fwdRef) {
    const internalRef = useRef<HTMLDivElement>(null);
    const wrapperRef = internalRef;

    // Merge forwarded ref
    useEffect(() => {
      if (typeof fwdRef === "function") {
        fwdRef(wrapperRef.current);
      } else if (fwdRef) {
        (fwdRef as React.MutableRefObject<HTMLDivElement | null>).current = wrapperRef.current;
      }
    }, [fwdRef]);

    useEffect(() => {
      const el = wrapperRef.current;
      const parent = el?.parentElement;
      if (!el || !parent) return;
      const element = el;
      const parentElement = parent;

      function updateScale() {
        const available = parentElement.clientWidth;
        if (available <= 0) return;
        const padding = 48;
        const s = Math.min(1, (available - padding) / A4_W_PX);
        element.style.transform = `scale(${s})`;
        element.style.marginBottom = `${-(A4_H_PX * (1 - s))}px`;
        element.style.marginRight = `${-(A4_W_PX * (1 - s))}px`;
      }

      updateScale();

      const observer = new ResizeObserver(updateScale);
      observer.observe(parentElement);
      return () => observer.disconnect();
    }, []);

    return (
      <div className="flex justify-center py-6">
        <div
          id="resume-print-root"
          ref={wrapperRef}
          className="a4-scaling-wrapper origin-top bg-white shadow-lg border border-gray-200"
          style={{
            width: A4_W_PX,
            height: A4_H_PX,
            transform: "scale(1)",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
