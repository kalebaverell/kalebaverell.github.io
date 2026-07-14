"use client";
// Client-side state store for the prototype: localStorage-backed, no accounts.
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AppState, Answers, Status, ChosenPath, ResumeState } from "./types";
import { generateGameplan, sampleAnswers } from "./rules";
import { careerById } from "./data";

const KEY = "vetpath_state_v1";

const initial: AppState = {
  profile: null,
  answers: {},
  gameplan: null,
  statuses: {},
  step: 0,
  theme: "professional",
  textSize: "base",
  assessment: {},
  assessmentFree: "",
  chosenPath: null,
  resume: null,
};

function planFor(p: AppState): AppState["gameplan"] {
  const career = careerById(p.chosenPath?.careerId);
  return generateGameplan(p.answers, career ? { career, fitPct: p.chosenPath?.fitPct ?? null } : null);
}

interface Store {
  s: AppState;
  ready: boolean;
  createProfile: (name: string, email: string) => void;
  setAnswer: (id: keyof Answers, value: any) => void;
  toggleMulti: (id: keyof Answers, value: string) => void;
  toggleGoal: (id: string) => void;
  setStep: (n: number) => void;
  regen: () => void;
  addGoal: (id: string) => void;
  cycleStatus: (id: string) => void;
  setTheme: (t: AppState["theme"]) => void;
  cycleTextSize: () => void;
  loadSample: () => void;
  reset: () => void;
  setStepNote: (stepId: string, text: string) => void;
  setAssessment: (qid: string, value: string) => void;
  setAssessmentFree: (text: string) => void;
  choosePath: (careerId: string, fitPct: number | null, why: string[]) => void;
  clearPath: () => void;
  setResume: (r: ResumeState | null) => void;
  hydrateRemote: (partial: Partial<AppState>) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [s, setS] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(s));
  }, [s, ready]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", s.theme);
  }, [s.theme]);

  useEffect(() => {
    if (s.textSize === "base") document.documentElement.removeAttribute("data-textsize");
    else document.documentElement.setAttribute("data-textsize", s.textSize);
  }, [s.textSize]);

  const createProfile = useCallback((name: string, email: string) => {
    setS((p) => ({ ...p, profile: { name: name.trim() || "Veteran", email: email.trim() }, step: 0 }));
  }, []);

  const setAnswer = useCallback((id: keyof Answers, value: any) => {
    setS((p) => ({ ...p, answers: { ...p.answers, [id]: value } }));
  }, []);

  const toggleMulti = useCallback((id: keyof Answers, value: string) => {
    setS((p) => {
      // Normalize: a legacy single-string value (from a question that used to be single-select)
      // must become [value], not be spread into individual characters.
      const cur = p.answers[id] as string[] | string | undefined;
      const arr: string[] = Array.isArray(cur) ? [...cur] : cur ? [cur] : [];
      const i = arr.indexOf(value);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(value);
      return { ...p, answers: { ...p.answers, [id]: arr } };
    });
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setS((p) => {
      const arr = [...(p.answers.topGoals || [])];
      const i = arr.indexOf(id);
      if (i >= 0) arr.splice(i, 1);
      else {
        if (arr.length >= 3) return p;
        arr.push(id);
      }
      return { ...p, answers: { ...p.answers, topGoals: arr } };
    });
  }, []);

  const setStep = useCallback((n: number) => setS((p) => ({ ...p, step: n })), []);

  const regen = useCallback(() => setS((p) => ({ ...p, gameplan: planFor(p) })), []);

  const addGoal = useCallback((id: string) => {
    setS((p) => {
      const arr = [...(p.answers.topGoals || [])];
      if (!arr.includes(id)) {
        if (arr.length >= 3) arr.shift();
        arr.push(id);
      }
      const next = { ...p, answers: { ...p.answers, topGoals: arr } };
      return { ...next, gameplan: planFor(next) };
    });
  }, []);

  const setStepNote = useCallback((stepId: string, text: string) => {
    setS((p) => ({ ...p, answers: { ...p.answers, stepNotes: { ...(p.answers.stepNotes || {}), [stepId]: text } } }));
  }, []);

  const setAssessment = useCallback((qid: string, value: string) => {
    setS((p) => ({ ...p, assessment: { ...p.assessment, [qid]: value } }));
  }, []);

  const setAssessmentFree = useCallback((text: string) => setS((p) => ({ ...p, assessmentFree: text })), []);

  const choosePath = useCallback((careerId: string, fitPct: number | null, why: string[]) => {
    setS((p) => {
      const next = { ...p, chosenPath: { careerId, fitPct, why } };
      return { ...next, gameplan: planFor(next) };
    });
  }, []);

  const clearPath = useCallback(() => {
    setS((p) => {
      const next = { ...p, chosenPath: null };
      return { ...next, gameplan: planFor(next) };
    });
  }, []);

  const setResume = useCallback((r: ResumeState | null) => setS((p) => ({ ...p, resume: r })), []);

  // Merge a profile blob loaded from the account backend into local state.
  const hydrateRemote = useCallback((partial: Partial<AppState>) => {
    setS((p) => ({ ...p, ...partial }));
  }, []);

  const cycleStatus = useCallback((id: string) => {
    setS((p) => {
      const cur: Status = p.statuses[id] || "todo";
      const next: Status = cur === "todo" ? "prog" : cur === "prog" ? "done" : "todo";
      return { ...p, statuses: { ...p.statuses, [id]: next } };
    });
  }, []);

  const setTheme = useCallback((t: AppState["theme"]) => setS((p) => ({ ...p, theme: t })), []);

  const cycleTextSize = useCallback(() => {
    setS((p) => {
      const next = p.textSize === "base" ? "lg" : p.textSize === "lg" ? "xl" : "base";
      return { ...p, textSize: next };
    });
  }, []);

  const loadSample = useCallback(() => {
    const answers = sampleAnswers();
    setS((p) => {
      const next: AppState = {
        ...p,
        profile: { name: "Frank (sample)", email: "" },
        answers,
        statuses: {},
        step: 0,
        chosenPath: null,
        gameplan: null,
      };
      return { ...next, gameplan: planFor(next) };
    });
  }, []);

  const reset = useCallback(() => setS(initial), []);

  return (
    <Ctx.Provider
      value={{ s, ready, createProfile, setAnswer, toggleMulti, toggleGoal, setStep, regen, addGoal, cycleStatus, setTheme, cycleTextSize, loadSample, reset, setStepNote, setAssessment, setAssessmentFree, choosePath, clearPath, setResume, hydrateRemote }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
