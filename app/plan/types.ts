export interface TripAnswers {
  purpose: string;
  style: string;
  companion: string;
  days: number;
  budget: string;
  mustVisit: string;
}

export interface ExtendedAnswers {
  dietary: string[];
  transport: string;
  accommodation: string;
  avoid: string;
  kpopSites: string;
}

export interface PlaceItem {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  duration: string;
  bestTime: string;
  expertTip: string;
  insiderNote?: string;
  whyPicked?: string;
  emoji: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  places: PlaceItem[];
}

export interface GeneratedPlan {
  title: string;
  overview: string;
  expertNote: string;
  days: DayPlan[];
}

export type AppStage = "questions" | "branch" | "extra" | "generating" | "plan" | "customize";
