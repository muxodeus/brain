// src/types/ai.ts
export type CardType =
  | "text"
  | "chart"
  | "recommendations"
  | "alert"
  | "table"
  | "actions";

export type AICard =
  | { type: "text"; title: string; content: string }
  | { type: "recommendations"; title: string; items: string[] }
  | { type: "alert"; title: string; content: string }
  | { type: "chart"; title: string; chartOptions: any }
  | { type: "table"; title: string; columns: string[]; rows: (string | number)[][] }
  | { type: "actions"; title: string; actions: { label: string; href: string }[] };

export type AIResponse = {
  prompt: string;
  summary?: string;
  keywords?: string[];
  suggestions?: string[];
  cards: AICard[];
};