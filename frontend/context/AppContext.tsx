"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TransformationGoal } from "@/backend/db";

export interface Meal {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch" | "Snack" | "Dinner";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  imageUrl?: string;
}

export interface ExerciseSet {
  setNumber: number;
  targetReps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  setsCount: number;
  targetReps: string;
  targetWeight: string;
  sets: ExerciseSet[];
  category: string;
  iconName: string;
}

export interface Workout {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  exerciseCount: number;
  estimatedCalories: number;
  exercises: Exercise[];
  completed: boolean;
}

export interface AIMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  actionableSuggestion?: {
    type: "workout" | "meal" | "water";
    title: string;
  };
}

export interface UserMetrics {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
  water: { current: number; target: number };
  steps: { current: number; target: number };
}

export interface UserProfile {
  name: string;
  weightKg: number;
  heightCm: number;
  goal: TransformationGoal;
  emailOrPhone?: string;
  isLoggedIn: boolean;
  isInitialSetupDone?: boolean;
}

interface AppContextType {
  userProfile: UserProfile;
  metrics: UserMetrics;
  meals: Meal[];
  activeWorkout: Workout;
  aiMessages: AIMessage[];
  isWorkoutActive: boolean;
  setIsWorkoutActive: (active: boolean) => void;
  registerUserAccount: (emailOrPhone: string, pass: string, name: string, weightKg: number, heightCm: number, goal: TransformationGoal) => Promise<boolean>;
  loginUserAccount: (emailOrPhone: string, pass: string) => Promise<boolean>;
  logoutUserAccount: () => void;
  updateUserProfile: (name: string, weightKg: number, heightCm: number, goal: TransformationGoal) => Promise<void>;
  logWater: (amountLiters: number) => Promise<void>;
  logSteps: (count: number) => Promise<void>;
  addMeal: (meal: Omit<Meal, "id" | "time">) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  toggleExerciseSet: (exerciseId: string, setIndex: number) => Promise<void>;
  generateCustomWorkout: (focusArea: string, variationId?: string) => Promise<void>;
  completeCurrentWorkout: () => Promise<void>;
  sendChatMessage: (text: string) => Promise<void>;
  refreshMacros: () => Promise<void>;
}

// Metrics start at ZERO (0)
const initialZeroMetrics: UserMetrics = {
  calories: { current: 0, target: 2650 },
  protein: { current: 0, target: 165 },
  carbs: { current: 0, target: 280 },
  fat: { current: 0, target: 70 },
  water: { current: 0, target: 3.0 },
  steps: { current: 0, target: 10000 },
};

const initialWorkout: Workout = {
  id: "w-1",
  title: "Chest & Push Day — Hypertrophy (6 Exercises)",
  category: "Push Day",
  durationMinutes: 55,
  exerciseCount: 6,
  estimatedCalories: 380,
  completed: false,
  exercises: [
    {
      id: "ex-1",
      name: "Barbell Bench Press",
      category: "Mid Chest",
      setsCount: 4,
      targetReps: "8-10",
      targetWeight: "75 kg",
      iconName: "dumbbell",
      sets: [
        { setNumber: 1, targetReps: 10, weight: 75, completed: false },
        { setNumber: 2, targetReps: 8, weight: 75, completed: false },
        { setNumber: 3, targetReps: 8, weight: 75, completed: false },
        { setNumber: 4, targetReps: 8, weight: 75, completed: false },
      ],
    },
    {
      id: "ex-2",
      name: "Incline Dumbbell Press",
      category: "Upper Chest",
      setsCount: 4,
      targetReps: "10-12",
      targetWeight: "30 kg",
      iconName: "dumbbell",
      sets: [
        { setNumber: 1, targetReps: 12, weight: 30, completed: false },
        { setNumber: 2, targetReps: 10, weight: 30, completed: false },
        { setNumber: 3, targetReps: 10, weight: 30, completed: false },
        { setNumber: 4, targetReps: 10, weight: 30, completed: false },
      ],
    },
    {
      id: "ex-3",
      name: "Cable Chest Flyes",
      category: "Chest Isolation",
      setsCount: 3,
      targetReps: "12-15",
      targetWeight: "18 kg",
      iconName: "zap",
      sets: [
        { setNumber: 1, targetReps: 15, weight: 18, completed: false },
        { setNumber: 2, targetReps: 12, weight: 18, completed: false },
        { setNumber: 3, targetReps: 12, weight: 18, completed: false },
      ],
    },
    {
      id: "ex-4",
      name: "Seated Dumbbell Shoulder Press",
      category: "Side Delts",
      setsCount: 3,
      targetReps: "10-12",
      targetWeight: "22 kg",
      iconName: "dumbbell",
      sets: [
        { setNumber: 1, targetReps: 12, weight: 22, completed: false },
        { setNumber: 2, targetReps: 10, weight: 22, completed: false },
        { setNumber: 3, targetReps: 10, weight: 22, completed: false },
      ],
    },
    {
      id: "ex-5",
      name: "Tricep Rope Pushdowns",
      category: "Triceps Lateral Head",
      setsCount: 3,
      targetReps: "12-15",
      targetWeight: "25 kg",
      iconName: "zap",
      sets: [
        { setNumber: 1, targetReps: 15, weight: 25, completed: false },
        { setNumber: 2, targetReps: 12, weight: 25, completed: false },
        { setNumber: 3, targetReps: 12, weight: 25, completed: false },
      ],
    },
    {
      id: "ex-6",
      name: "Overhead Dumbbell Tricep Extension",
      category: "Triceps Long Head",
      setsCount: 3,
      targetReps: "12-15",
      targetWeight: "22 kg",
      iconName: "zap",
      sets: [
        { setNumber: 1, targetReps: 15, weight: 22, completed: false },
        { setNumber: 2, targetReps: 12, weight: 22, completed: false },
        { setNumber: 3, targetReps: 12, weight: 22, completed: false },
      ],
    },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Raghu",
    weightKg: 75,
    heightCm: 178,
    goal: "Lean Bulk",
    emailOrPhone: "",
    isLoggedIn: false,
  });

  const [metrics, setMetrics] = useState<UserMetrics>(initialZeroMetrics);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout>(initialWorkout);
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);

  // Restore login session from localStorage
  useEffect(() => {
    async function loadBackendData() {
      try {
        const savedAuth = localStorage.getItem("fitmaster_auth");
        if (savedAuth) {
          const authData = JSON.parse(savedAuth);
          if (authData.emailOrPhone && authData.password) {
            const loginRes = await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ emailOrPhone: authData.emailOrPhone, password: authData.password }),
            }).then((r) => r.json());

            if (loginRes.success && loginRes.profile) {
              setUserProfile({ ...loginRes.profile, isLoggedIn: true });
            }
          }
        }

        const [metricsRes, mealsRes, workoutRes, aiRes] = await Promise.all([
          fetch("/api/metrics?reset=true").then((r) => r.json()),
          fetch("/api/meals").then((r) => r.json()),
          fetch("/api/workout").then((r) => r.json()),
          fetch("/api/ai/chat").then((r) => r.json()),
        ]);

        if (metricsRes.success && metricsRes.metrics) setMetrics(metricsRes.metrics);
        if (mealsRes.success && mealsRes.meals) setMeals(mealsRes.meals);
        if (workoutRes.success && workoutRes.workout) setActiveWorkout(workoutRes.workout);
        if (aiRes.success && aiRes.messages) setAiMessages(aiRes.messages);
      } catch (err) {
        console.error("Error connecting to backend API:", err);
      }
    }
    loadBackendData();
  }, []);

  const registerUserAccount = async (emailOrPhone: string, pass: string, name: string, weightKg: number, heightCm: number, goal: TransformationGoal): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password: pass, name: name || "Raghu", weightKg, heightCm, goal }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile({ ...data.profile, isLoggedIn: true });
        setMetrics(data.metrics);
        localStorage.setItem("fitmaster_auth", JSON.stringify({ emailOrPhone, password: pass }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Registration error:", err);
      return false;
    }
  };

  const loginUserAccount = async (emailOrPhone: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setUserProfile({ ...data.profile, isLoggedIn: true });
        setMetrics(data.metrics);
        localStorage.setItem("fitmaster_auth", JSON.stringify({ emailOrPhone, password: pass }));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logoutUserAccount = () => {
    localStorage.removeItem("fitmaster_auth");
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
  };

  const updateUserProfile = async (name: string, weightKg: number, heightCm: number, goal: TransformationGoal) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || "Raghu", weightKg, heightCm, goal }),
      });
      const data = await res.json();
      if (data.success) {
        setUserProfile((prev) => ({ ...data.profile, isLoggedIn: prev.isLoggedIn }));
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("API error updating profile:", err);
    }
  };

  const refreshMacros = async () => {
    try {
      const res = await fetch("/api/metrics?reset=true");
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
        setMeals([]);
      }
    } catch (err) {
      console.error("Error refreshing macros:", err);
    }
  };

  const logWater = async (amountLiters: number) => {
    setMetrics((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        current: Number((prev.water.current + amountLiters).toFixed(1)),
      },
    }));

    try {
      const res = await fetch("/api/metrics/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountLiters }),
      });
      const data = await res.json();
      if (data.success && data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("API error logging water:", err);
    }
  };

  const logSteps = async (count: number) => {
    setMetrics((prev) => ({
      ...prev,
      steps: {
        ...prev.steps,
        current: prev.steps.current + count,
      },
    }));
  };

  const addMeal = async (newMealData: Omit<Meal, "id" | "time">) => {
    try {
      const res = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMealData),
      });
      const data = await res.json();
      if (data.success) {
        setMeals(data.meals || [data.meal, ...meals]);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("API error adding meal:", err);
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const res = await fetch(`/api/meals?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMeals((prev) => prev.filter((m) => m.id !== id));
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("API error deleting meal:", err);
    }
  };

  const toggleExerciseSet = async (exerciseId: string, setIndex: number) => {
    setActiveWorkout((prev) => {
      const updatedExercises = prev.exercises.map((ex) => {
        if (ex.id === exerciseId) {
          const newSets = ex.sets.map((set, idx) =>
            idx === setIndex ? { ...set, completed: !set.completed } : set
          );
          return { ...ex, sets: newSets };
        }
        return ex;
      });
      return { ...prev, exercises: updatedExercises };
    });

    try {
      const res = await fetch("/api/workout/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId, setIndex }),
      });
      const data = await res.json();
      if (data.success && data.workout) {
        setActiveWorkout(data.workout);
      }
    } catch (err) {
      console.error("API error updating set:", err);
    }
  };

  const generateCustomWorkout = async (focusArea: string, variationId: string = "var-a") => {
    try {
      const res = await fetch("/api/workout/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusArea, variationId }),
      });
      const data = await res.json();
      if (data.success && data.workout) {
        setActiveWorkout(data.workout);
      }
    } catch (err) {
      console.error("API error generating workout:", err);
    }
  };

  const completeCurrentWorkout = async () => {
    setActiveWorkout((prev) => ({ ...prev, completed: true }));
    setIsWorkoutActive(false);

    try {
      const res = await fetch("/api/workout/complete", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        if (data.workout) setActiveWorkout(data.workout);
        if (data.aiMessage) {
          setAiMessages((prev) => [...prev, data.aiMessage]);
        }
      }
    } catch (err) {
      console.error("API error completing workout:", err);
    }
  };

  const sendChatMessage = async (text: string) => {
    const tempUserMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.success && data.allMessages) {
        setAiMessages(data.allMessages);
      }
    } catch (err) {
      console.error("API error sending AI message:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        userProfile,
        metrics,
        meals,
        activeWorkout,
        aiMessages,
        isWorkoutActive,
        setIsWorkoutActive,
        registerUserAccount,
        loginUserAccount,
        logoutUserAccount,
        updateUserProfile,
        logWater,
        logSteps,
        addMeal,
        deleteMeal,
        toggleExerciseSet,
        generateCustomWorkout,
        completeCurrentWorkout,
        sendChatMessage,
        refreshMacros,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
