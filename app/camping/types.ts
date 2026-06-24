export interface CampTrip {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  groupSize: number;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  custom?: boolean;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  emoji: string;
  items: ChecklistItem[];
}

export interface MealPlan {
  id: string;
  day: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  menu: string;
  ingredients: string[];
}

export interface CampingData {
  trip: CampTrip | null;
  checklists: ChecklistCategory[];
  meals: MealPlan[];
}

export type AppView = "home" | "trip-setup" | "checklist" | "meals" | "summary";
