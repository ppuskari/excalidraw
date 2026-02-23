import { useEffect, useRef, useState } from "react";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

import "./PerformanceOverlay.scss";

const DARK_MODE_KEY = "excalidraw-perf-overlay-dark";

const HISTORY_LENGTH = 60;
const UPDATE_INTERVAL_MS = 500;

interface Metrics {
  fps: number;
  frameTime: number;
  elementCount: number;
  memoryMB: number | null;
  zoom: number;
}

interface Props {
  excalidrawAPI: ExcalidrawImperativeAPI;
  onClose: () => void;
}

const getFpsColor = (fps: number): string => {
  if (fps >= 55) return "#4ade80";
  if (fps >= 30) return "#facc15";
  return "#f87171";
};

export const PerformanceOverlay = ({ excalidrawAPI, onClose }: Props) => {
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem(DARK_MODE_KEY) !== "false",
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem(DARK_MODE_KEY, String(next));
      return next;
    });
  };

  const [metrics, setMetrics] = useState<Metrics>({
    fps: 0,
    frameTime: 0,
    elementCount: 0,
    memoryMB: null,
    zoom: 100,
  });
  const fpsHistoryRef = useRef<number[]>(Array(HISTORY_LENGTH).fill(0));
  const [fpsHistory, setFpsHistory] = useState<number[]>(
    Array(HISTORY_LENGTH).fill(0),
  );

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let lastUpdateTime = lastTime;
    let animFrameId: number;

    const loop = (now: number) => {
      frameCount++;
      const frameTime = now - lastTime;
      lastTime = now;

      if (now - lastUpdateTime >= UPDATE_INTERVAL_MS) {
        const elapsed = now - lastUpdateTime;
        const fps = Math.round((frameCount * 1000) / elapsed);

        fpsHistoryRef.current = [...fpsHistoryRef.current.slice(1), fps];
        setFpsHistory([...fpsHistoryRef.current]);

        const elementCount = excalidrawAPI
          .getSceneElements()
          .filter((el) => !el.isDeleted).length;
        const appState = excalidrawAPI.getAppState();

        type PerfWithMemory = Performance & {
          memory?: { usedJSHeapSize: number };
        };
        const memoryMB =
          (performance as PerfWithMemory).memory?.usedJSHeapSize != null
            ? Math.round(
                (performance as PerfWithMemory).memory!.usedJSHeapSize /
                  1_048_576,
              )
            : null;

        setMetrics({
          fps,
          frameTime: Math.round(frameTime * 10) / 10,
          elementCount,
          memoryMB,
          zoom: Math.round(appState.zoom.value * 100),
        });

        frameCount = 0;
        lastUpdateTime = now;
      }

      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, [excalidrawAPI]);

  const maxFps = 60;
  const fpsColor = getFpsColor(metrics.fps);

  return (
    <div className={`perf-overlay${isDark ? "" : " perf-overlay--light"}`}>
      <div className="perf-overlay__header">
        <span className="perf-overlay__title">⚡ Performance</span>
        <div className="perf-overlay__controls">
          <button
            className="perf-overlay__theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
          <button
            className="perf-overlay__close"
            onClick={onClose}
            title="Close (Alt+P)"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="perf-overlay__sparkline" title="FPS history">
        {fpsHistory.map((f, i) => (
          <div
            key={i}
            className="perf-overlay__bar"
            style={{
              height: `${Math.round((Math.min(f, maxFps) / maxFps) * 100)}%`,
              backgroundColor: getFpsColor(f),
              opacity: 0.25 + (i / HISTORY_LENGTH) * 0.75,
            }}
          />
        ))}
      </div>

      <div className="perf-overlay__metrics">
        <div className="perf-overlay__row">
          <span className="perf-overlay__label">FPS</span>
          <span className="perf-overlay__value" style={{ color: fpsColor }}>
            {metrics.fps}
          </span>
        </div>
        <div className="perf-overlay__row">
          <span className="perf-overlay__label">Frame time</span>
          <span className="perf-overlay__value">{metrics.frameTime} ms</span>
        </div>
        <div className="perf-overlay__row">
          <span className="perf-overlay__label">Elements</span>
          <span className="perf-overlay__value">{metrics.elementCount}</span>
        </div>
        {metrics.memoryMB !== null && (
          <div className="perf-overlay__row">
            <span className="perf-overlay__label">JS heap</span>
            <span className="perf-overlay__value">{metrics.memoryMB} MB</span>
          </div>
        )}
        <div className="perf-overlay__row">
          <span className="perf-overlay__label">Zoom</span>
          <span className="perf-overlay__value">{metrics.zoom}%</span>
        </div>
      </div>

      <div className="perf-overlay__hint">Alt+P to toggle</div>
    </div>
  );
};
