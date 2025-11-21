import { useRef, useCallback } from "react";

export const useCanvasHistory = () => {
  const historyRef = useRef([]);
  const redoRef = useRef([]);

  const pushHistory = useCallback((canvas) => {
    try {
      if (!canvas) return;
      const json = JSON.stringify(canvas.toJSON(["selectable"]));
      const last = historyRef.current[historyRef.current.length - 1];
      if (json !== last) {
        historyRef.current.push(json);
        if (historyRef.current.length > 60) historyRef.current.shift();
        redoRef.current = [];
      }
    } catch (err) {
      console.error("Error updating canvas history:", err);
    }
  }, []);

  const undo = useCallback(async (canvas) => {
    if (!canvas || historyRef.current.length <= 1) return;
    const current = historyRef.current.pop();
    redoRef.current.push(current);
    const prev = historyRef.current[historyRef.current.length - 1];
    if (prev) {
      try {
        await canvas.loadFromJSON(prev);
        canvas.renderAll();
      } catch (error) {
        console.error("Error undoing:", error);
      }
    }
  }, []);

  const redo = useCallback(async (canvas) => {
    if (!canvas || !redoRef.current.length) return;
    const next = redoRef.current.pop();
    historyRef.current.push(next);
    try {
      await canvas.loadFromJSON(next);
      canvas.renderAll();
    } catch (error) {
      console.error("Error redoing:", error);
    }
  }, []);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    redoRef.current = [];
  }, []);

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
  };
};
