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

export type TransformationGoal = "Bulking" | "Cutting" | "Lean Bulk";

export interface UserAccount {
  id: string;
  emailOrPhone: string;
  passwordHash: string;
  name: string;
  weightKg: number;
  heightCm: number;
  goal: TransformationGoal;
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

export interface ProgressSummary {
  weeklyCalorieHistory: { day: string; calories: number; target: number }[];
  weightTrend: { date: string; weightKg: number }[];
  workoutStreakDays: number;
  totalWorkoutsThisMonth: number;
  averageSleepHours: number;
  totalVolumeLiftedKg: number;
}

class FitMasterDatabase {
  private accounts: UserAccount[] = [
    {
      id: "usr-demo",
      emailOrPhone: "raghu@example.com",
      passwordHash: "password123",
      name: "Raghu",
      weightKg: 75,
      heightCm: 178,
      goal: "Lean Bulk",
    },
  ];

  private currentUserId: string | null = "usr-demo";

  // Default name is Raghu
  private userProfile: UserProfile = {
    name: "Raghu",
    weightKg: 75,
    heightCm: 178,
    goal: "Lean Bulk",
    emailOrPhone: "raghu@example.com",
    isLoggedIn: false,
  };

  // Metrics start at ZERO (0)
  private metrics: UserMetrics = {
    calories: { current: 0, target: 2650 },
    protein: { current: 0, target: 165 },
    carbs: { current: 0, target: 280 },
    fat: { current: 0, target: 70 },
    water: { current: 0, target: 3.0 },
    steps: { current: 0, target: 10000 },
  };

  private meals: Meal[] = [];

  private activeWorkout: Workout = {
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

  private aiMessages: AIMessage[] = [
    {
      id: "msg-1",
      sender: "ai",
      text: "Good morning Raghu! 👋 I am your Gemini AI Fitness & Nutrition Coach. I'm ready to analyze your daily recovery, suggest meals, or optimize your workout plans!",
      timestamp: "09:00 AM",
      actionableSuggestion: {
        type: "workout",
        title: "Start Active 6-Exercise Workout Plan",
      },
    },
  ];

  private progress: ProgressSummary = {
    weeklyCalorieHistory: [
      { day: "Mon", calories: 2600, target: 2650 },
      { day: "Tue", calories: 2550, target: 2650 },
      { day: "Wed", calories: 2700, target: 2650 },
      { day: "Thu", calories: 2620, target: 2650 },
      { day: "Fri", calories: 2750, target: 2650 },
      { day: "Sat", calories: 2200, target: 2650 },
      { day: "Sun", calories: 0, target: 2650 },
    ],
    weightTrend: [
      { date: "Aug 06", weightKg: 75.8 },
      { date: "Aug 07", weightKg: 75.6 },
      { date: "Aug 08", weightKg: 75.5 },
      { date: "Aug 09", weightKg: 75.4 },
      { date: "Aug 10", weightKg: 75.2 },
      { date: "Aug 11", weightKg: 75.1 },
      { date: "Aug 12", weightKg: 75.0 },
    ],
    workoutStreakDays: 8,
    totalWorkoutsThisMonth: 10,
    averageSleepHours: 7.8,
    totalVolumeLiftedKg: 12450,
  };

  // Auth Methods: Register / Login
  registerUser(emailOrPhone: string, passwordHash: string, name: string, weightKg: number, heightCm: number, goal: TransformationGoal): { success: boolean; profile: UserProfile; metrics: UserMetrics; message?: string } {
    const normalizedInput = emailOrPhone.trim().toLowerCase();
    const existing = this.accounts.find((a) => a.emailOrPhone.toLowerCase() === normalizedInput);
    if (existing) {
      return { success: false, profile: this.getUserProfile(), metrics: this.getMetrics(), message: "Account already exists with this Email/Phone!" };
    }

    const newAcc: UserAccount = {
      id: `usr-${Date.now()}`,
      emailOrPhone: normalizedInput,
      passwordHash,
      name: name || "Raghu",
      weightKg,
      heightCm,
      goal,
    };

    this.accounts.push(newAcc);
    this.currentUserId = newAcc.id;
    this.userProfile = {
      name: name || "Raghu",
      weightKg,
      heightCm,
      goal,
      emailOrPhone: normalizedInput,
      isLoggedIn: true,
      isInitialSetupDone: true,
    };

    this.recalculateTargets();
    this.resetMetrics();

    return { success: true, profile: this.getUserProfile(), metrics: this.getMetrics() };
  }

  loginUser(emailOrPhone: string, passwordHash: string): { success: boolean; profile: UserProfile; metrics: UserMetrics; message?: string } {
    const normalizedInput = emailOrPhone.trim().toLowerCase();
    const account = this.accounts.find(
      (a) => a.emailOrPhone.toLowerCase() === normalizedInput && a.passwordHash === passwordHash
    );

    if (!account) {
      return { success: false, profile: this.getUserProfile(), metrics: this.getMetrics(), message: "Invalid email/phone or password!" };
    }

    this.currentUserId = account.id;
    this.userProfile = {
      name: account.name,
      weightKg: account.weightKg,
      heightCm: account.heightCm,
      goal: account.goal,
      emailOrPhone: account.emailOrPhone,
      isLoggedIn: true,
      isInitialSetupDone: true,
    };

    this.recalculateTargets();
    return { success: true, profile: this.getUserProfile(), metrics: this.getMetrics() };
  }

  logoutUser(): UserProfile {
    this.userProfile.isLoggedIn = false;
    return this.getUserProfile();
  }

  getUserProfile(): UserProfile {
    return { ...this.userProfile };
  }

  updateUserProfile(name: string, weightKg: number, heightCm: number, goal: TransformationGoal = "Lean Bulk"): { profile: UserProfile; metrics: UserMetrics } {
    this.userProfile = {
      ...this.userProfile,
      name: name || "Raghu",
      weightKg,
      heightCm,
      goal,
      isInitialSetupDone: true,
    };

    this.recalculateTargets();
    return { profile: this.getUserProfile(), metrics: this.getMetrics() };
  }

  private recalculateTargets() {
    const bw = this.userProfile.weightKg;
    const ht = this.userProfile.heightCm;
    const baseKcal = Math.round(bw * 30 + ht * 2);

    let targetKcal = baseKcal;
    let pMult = 2.0;
    let cMult = 3.2;
    let fMult = 0.9;

    if (this.userProfile.goal === "Bulking") {
      targetKcal = baseKcal + 500;
      pMult = 2.2;
      cMult = 4.0;
      fMult = 1.0;
    } else if (this.userProfile.goal === "Cutting") {
      targetKcal = baseKcal - 400;
      pMult = 2.4;
      cMult = 2.5;
      fMult = 0.8;
    } else {
      targetKcal = baseKcal + 250;
      pMult = 2.2;
      cMult = 3.5;
      fMult = 0.9;
    }

    this.metrics.calories.target = targetKcal;
    this.metrics.protein.target = Math.round(bw * pMult);
    this.metrics.carbs.target = Math.round(bw * cMult);
    this.metrics.fat.target = Math.round(bw * fMult);
  }

  // Metrics Methods (Starts at 0)
  getMetrics(): UserMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): UserMetrics {
    this.metrics.calories.current = 0;
    this.metrics.protein.current = 0;
    this.metrics.carbs.current = 0;
    this.metrics.fat.current = 0;
    this.metrics.water.current = 0;
    this.metrics.steps.current = 0;
    this.meals = [];
    return this.getMetrics();
  }

  logWater(amountLiters: number): UserMetrics {
    this.metrics.water.current = Number(
      (this.metrics.water.current + amountLiters).toFixed(1)
    );
    return this.getMetrics();
  }

  logSteps(stepCount: number): UserMetrics {
    this.metrics.steps.current += stepCount;
    return this.getMetrics();
  }

  // Meals Methods
  getMeals(): Meal[] {
    return [...this.meals];
  }

  addMeal(mealData: Omit<Meal, "id" | "time">): { meal: Meal; metrics: UserMetrics; meals: Meal[] } {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMeal: Meal = {
      ...mealData,
      id: `m-${Date.now()}`,
      time: timeStr,
    };

    this.meals = [newMeal, ...this.meals];

    this.metrics.calories.current += newMeal.calories;
    this.metrics.protein.current += newMeal.protein;
    this.metrics.carbs.current += newMeal.carbs;
    this.metrics.fat.current += newMeal.fat;

    return { meal: newMeal, metrics: this.getMetrics(), meals: this.getMeals() };
  }

  deleteMeal(id: string): { success: boolean; metrics: UserMetrics; meals: Meal[] } {
    const targetMeal = this.meals.find((m) => m.id === id);
    if (!targetMeal) {
      return { success: false, metrics: this.getMetrics(), meals: this.getMeals() };
    }

    this.meals = this.meals.filter((m) => m.id !== id);
    this.metrics.calories.current = Math.max(0, this.metrics.calories.current - targetMeal.calories);
    this.metrics.protein.current = Math.max(0, this.metrics.protein.current - targetMeal.protein);
    this.metrics.carbs.current = Math.max(0, this.metrics.carbs.current - targetMeal.carbs);
    this.metrics.fat.current = Math.max(0, this.metrics.fat.current - targetMeal.fat);

    return { success: true, metrics: this.getMetrics(), meals: this.getMeals() };
  }

  // Workout Generator with EXACTLY 6 EXERCISES for EVERY workout day
  generateWorkout(focusArea: string, variationId: string = "var-a"): Workout {
    const bw = this.userProfile.weightKg;
    let title = `${focusArea} Session`;
    let exercises: Exercise[] = [];
    let duration = 60;
    let estimatedCalories = 420;

    const area = focusArea.toLowerCase();

    // ── CHEST & PUSH DAY (6 EXERCISES) ──
    if (area.includes("chest") || area.includes("push")) {
      title = "Push Day — Chest, Shoulders & Triceps (6 Exercises)";
      duration = 60;
      estimatedCalories = 410;
      exercises = [
        {
          id: "ex-1",
          name: "Barbell Bench Press",
          category: "Mid Chest",
          setsCount: 4,
          targetReps: "8-10",
          targetWeight: `${Math.round(bw * 1.1)} kg`,
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 10, weight: Math.round(bw * 1.1), completed: false },
            { setNumber: 2, targetReps: 8, weight: Math.round(bw * 1.1), completed: false },
            { setNumber: 3, targetReps: 8, weight: Math.round(bw * 1.1), completed: false },
            { setNumber: 4, targetReps: 8, weight: Math.round(bw * 1.1), completed: false },
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
          category: "Front & Side Delts",
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
      ];
    } 
    // ── BACK & PULL DAY (6 EXERCISES) ──
    else if (area.includes("back") || area.includes("pull")) {
      title = "Pull Day — Lats, Upper Back & Biceps (6 Exercises)";
      duration = 60;
      estimatedCalories = 430;
      exercises = [
        {
          id: "ex-1",
          name: "Conventional Barbell Deadlift",
          category: "Posterior Chain / Thick Back",
          setsCount: 4,
          targetReps: "6-8",
          targetWeight: `${Math.round(bw * 1.4)} kg`,
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 8, weight: Math.round(bw * 1.4), completed: false },
            { setNumber: 2, targetReps: 6, weight: Math.round(bw * 1.4), completed: false },
            { setNumber: 3, targetReps: 6, weight: Math.round(bw * 1.4), completed: false },
            { setNumber: 4, targetReps: 6, weight: Math.round(bw * 1.4), completed: false },
          ],
        },
        {
          id: "ex-2",
          name: "Wide Grip Lat Pulldown",
          category: "Lats & Width",
          setsCount: 4,
          targetReps: "10-12",
          targetWeight: "65 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 65, completed: false },
            { setNumber: 2, targetReps: 10, weight: 65, completed: false },
            { setNumber: 3, targetReps: 10, weight: 65, completed: false },
            { setNumber: 4, targetReps: 10, weight: 65, completed: false },
          ],
        },
        {
          id: "ex-3",
          name: "Seated Cable Rows",
          category: "Mid Back & Rhomboids",
          setsCount: 3,
          targetReps: "10-12",
          targetWeight: "60 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 60, completed: false },
            { setNumber: 2, targetReps: 10, weight: 60, completed: false },
            { setNumber: 3, targetReps: 10, weight: 60, completed: false },
          ],
        },
        {
          id: "ex-4",
          name: "Single-Arm Dumbbell Row",
          category: "Unilateral Lats",
          setsCount: 3,
          targetReps: "10-12",
          targetWeight: "32 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 32, completed: false },
            { setNumber: 2, targetReps: 10, weight: 32, completed: false },
            { setNumber: 3, targetReps: 10, weight: 32, completed: false },
          ],
        },
        {
          id: "ex-5",
          name: "Barbell Bicep Curls",
          category: "Biceps Both Heads",
          setsCount: 3,
          targetReps: "10-12",
          targetWeight: "30 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 30, completed: false },
            { setNumber: 2, targetReps: 10, weight: 30, completed: false },
            { setNumber: 3, targetReps: 10, weight: 30, completed: false },
          ],
        },
        {
          id: "ex-6",
          name: "Dumbbell Hammer Curls",
          category: "Brachialis & Forearms",
          setsCount: 3,
          targetReps: "12-15",
          targetWeight: "16 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 15, weight: 16, completed: false },
            { setNumber: 2, targetReps: 12, weight: 16, completed: false },
            { setNumber: 3, targetReps: 12, weight: 16, completed: false },
          ],
        },
      ];
    } 
    // ── LEG DAY (6 EXERCISES) ──
    else if (area.includes("leg") || area.includes("squat")) {
      title = "Leg Day — Quads, Hamstrings & Glutes (6 Exercises)";
      duration = 65;
      estimatedCalories = 480;
      exercises = [
        {
          id: "ex-1",
          name: "Barbell Back Squats",
          category: "Quads & Glutes",
          setsCount: 4,
          targetReps: "8-10",
          targetWeight: `${Math.round(bw * 1.25)} kg`,
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 10, weight: Math.round(bw * 1.25), completed: false },
            { setNumber: 2, targetReps: 8, weight: Math.round(bw * 1.25), completed: false },
            { setNumber: 3, targetReps: 8, weight: Math.round(bw * 1.25), completed: false },
            { setNumber: 4, targetReps: 8, weight: Math.round(bw * 1.25), completed: false },
          ],
        },
        {
          id: "ex-2",
          name: "Barbell Romanian Deadlift (RDL)",
          category: "Hamstrings & Glutes",
          setsCount: 4,
          targetReps: "8-10",
          targetWeight: `${Math.round(bw * 1.15)} kg`,
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 10, weight: Math.round(bw * 1.15), completed: false },
            { setNumber: 2, targetReps: 8, weight: Math.round(bw * 1.15), completed: false },
            { setNumber: 3, targetReps: 8, weight: Math.round(bw * 1.15), completed: false },
            { setNumber: 4, targetReps: 8, weight: Math.round(bw * 1.15), completed: false },
          ],
        },
        {
          id: "ex-3",
          name: "45-Degree Leg Press",
          category: "Quads Sweep",
          setsCount: 3,
          targetReps: "10-12",
          targetWeight: "160 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 160, completed: false },
            { setNumber: 2, targetReps: 10, weight: 160, completed: false },
            { setNumber: 3, targetReps: 10, weight: 160, completed: false },
          ],
        },
        {
          id: "ex-4",
          name: "Lying Leg Curls",
          category: "Hamstring Isolation",
          setsCount: 3,
          targetReps: "12-15",
          targetWeight: "45 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 15, weight: 45, completed: false },
            { setNumber: 2, targetReps: 12, weight: 45, completed: false },
            { setNumber: 3, targetReps: 12, weight: 45, completed: false },
          ],
        },
        {
          id: "ex-5",
          name: "Dumbbell Walking Lunges",
          category: "Unilateral Legs & Glutes",
          setsCount: 3,
          targetReps: "12 steps/leg",
          targetWeight: "20 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 20, completed: false },
            { setNumber: 2, targetReps: 12, weight: 20, completed: false },
            { setNumber: 3, targetReps: 12, weight: 20, completed: false },
          ],
        },
        {
          id: "ex-6",
          name: "Standing Machine Calf Raise",
          category: "Calves",
          setsCount: 4,
          targetReps: "15-20",
          targetWeight: "70 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 20, weight: 70, completed: false },
            { setNumber: 2, targetReps: 18, weight: 70, completed: false },
            { setNumber: 3, targetReps: 15, weight: 70, completed: false },
            { setNumber: 4, targetReps: 15, weight: 70, completed: false },
          ],
        },
      ];
    } 
    // ── FULL BODY HIIT & CONDITIONING (6 EXERCISES) ──
    else {
      title = "Full Body — Strength & HIIT Conditioning (6 Exercises)";
      duration = 55;
      estimatedCalories = 450;
      exercises = [
        {
          id: "ex-1",
          name: "Dumbbell Goblet Squats",
          category: "Full Body / Quads",
          setsCount: 3,
          targetReps: "12-15",
          targetWeight: "28 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 15, weight: 28, completed: false },
            { setNumber: 2, targetReps: 12, weight: 28, completed: false },
            { setNumber: 3, targetReps: 12, weight: 28, completed: false },
          ],
        },
        {
          id: "ex-2",
          name: "Push-ups to Dumbbell Renegade Rows",
          category: "Chest & Upper Back",
          setsCount: 3,
          targetReps: "10-12",
          targetWeight: "18 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 18, completed: false },
            { setNumber: 2, targetReps: 10, weight: 18, completed: false },
            { setNumber: 3, targetReps: 10, weight: 18, completed: false },
          ],
        },
        {
          id: "ex-3",
          name: "Kettlebell Swings",
          category: "Posterior Power",
          setsCount: 4,
          targetReps: "20",
          targetWeight: "24 kg",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 20, weight: 24, completed: false },
            { setNumber: 2, targetReps: 20, weight: 24, completed: false },
            { setNumber: 3, targetReps: 20, weight: 24, completed: false },
            { setNumber: 4, targetReps: 20, weight: 24, completed: false },
          ],
        },
        {
          id: "ex-4",
          name: "Dumbbell Thrusters (Squat to Overhead Press)",
          category: "Full Body Power",
          setsCount: 3,
          targetReps: "12",
          targetWeight: "16 kg",
          iconName: "dumbbell",
          sets: [
            { setNumber: 1, targetReps: 12, weight: 16, completed: false },
            { setNumber: 2, targetReps: 12, weight: 16, completed: false },
            { setNumber: 3, targetReps: 12, weight: 16, completed: false },
          ],
        },
        {
          id: "ex-5",
          name: "Hanging Leg / Knee Raises",
          category: "Lower Abs & Core",
          setsCount: 3,
          targetReps: "15",
          targetWeight: "Bodyweight",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 15, weight: 0, completed: false },
            { setNumber: 2, targetReps: 15, weight: 0, completed: false },
            { setNumber: 3, targetReps: 15, weight: 0, completed: false },
          ],
        },
        {
          id: "ex-6",
          name: "Plank Shoulder Taps",
          category: "Anti-Rotation Core",
          setsCount: 3,
          targetReps: "45 sec",
          targetWeight: "Bodyweight",
          iconName: "zap",
          sets: [
            { setNumber: 1, targetReps: 45, weight: 0, completed: false },
            { setNumber: 2, targetReps: 45, weight: 0, completed: false },
            { setNumber: 3, targetReps: 45, weight: 0, completed: false },
          ],
        },
      ];
    }

    this.activeWorkout = {
      id: `w-${Date.now()}`,
      title,
      category: "Custom Plan",
      durationMinutes: duration,
      exerciseCount: exercises.length,
      estimatedCalories,
      completed: false,
      exercises,
    };

    return this.getWorkout();
  }

  getWorkout(): Workout {
    return JSON.parse(JSON.stringify(this.activeWorkout));
  }

  toggleExerciseSet(exerciseId: string, setIndex: number): Workout {
    this.activeWorkout.exercises = this.activeWorkout.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const newSets = ex.sets.map((set, idx) => {
          if (idx === setIndex) {
            const nextCompleted = !set.completed;
            if (nextCompleted) {
              this.progress.totalVolumeLiftedKg += set.weight * set.targetReps;
            }
            return { ...set, completed: nextCompleted };
          }
          return set;
        });
        return { ...ex, sets: newSets };
      }
      return ex;
    });
    return this.getWorkout();
  }

  completeWorkout(): { workout: Workout; aiMessage: AIMessage } {
    this.activeWorkout.completed = true;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const completionMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: "ai",
      text: `🎉 Good morning ${this.userProfile.name}! Workout Completed on ${this.activeWorkout.title}. You burned ~${this.activeWorkout.estimatedCalories} kcal. Hydrate and log your post-workout shake!`,
      timestamp: timeStr,
      actionableSuggestion: {
        type: "meal",
        title: "Log Post-Workout Protein Shake (+30g Protein)",
      },
    };

    this.aiMessages.push(completionMsg);
    return { workout: this.getWorkout(), aiMessage: completionMsg };
  }

  // AI Assistant Methods (Greetings matching profile name "Raghu")
  getAIMessages(): AIMessage[] {
    return [...this.aiMessages];
  }

  addAIMessage(userText: string): { userMsg: AIMessage; aiMsg: AIMessage } {
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: timeStr,
    };
    this.aiMessages.push(userMsg);

    const lower = userText.toLowerCase();
    let replyText = "";
    let suggestion: AIMessage["actionableSuggestion"] = undefined;

    if (lower.includes("protein") || lower.includes("snack") || lower.includes("eat") || lower.includes("food")) {
      replyText = `Good morning ${this.userProfile.name}! For your ${this.userProfile.goal} goal (${this.userProfile.weightKg}kg BW), target is ${this.metrics.protein.target}g protein. Currently logged: ${this.metrics.protein.current}g.`;
      suggestion = { type: "meal", title: `Add High Protein Meal` };
    } else if (lower.includes("workout") || lower.includes("plan") || lower.includes("exercise")) {
      replyText = `Good morning ${this.userProfile.name}! Choose from Chest & Push, Back & Pull, Leg Day, or Full Body. Each active plan gives you 6 structured exercises calculated for your ${this.userProfile.weightKg}kg body weight!`;
      suggestion = { type: "workout", title: "Select Active 6-Exercise Plan" };
    } else {
      replyText = `Good morning ${this.userProfile.name}! Your current metrics: Calories: ${this.metrics.calories.current}/${this.metrics.calories.target} kcal, Protein: ${this.metrics.protein.current}/${this.metrics.protein.target}g, Water: ${this.metrics.water.current}L, Steps: ${this.metrics.steps.current}. Transformation Goal: ${this.userProfile.goal}.`;
    }

    const aiMsg: AIMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: "ai",
      text: replyText,
      timestamp: timeStr,
      actionableSuggestion: suggestion,
    };
    this.aiMessages.push(aiMsg);

    return { userMsg, aiMsg };
  }

  // Progress Methods
  getProgress(): ProgressSummary {
    return { ...this.progress };
  }

  addWeightEntry(weightKg: number): ProgressSummary {
    const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    this.progress.weightTrend = [
      ...this.progress.weightTrend,
      { date: todayStr, weightKg },
    ];
    this.userProfile.weightKg = weightKg;
    this.updateUserProfile(this.userProfile.name, weightKg, this.userProfile.heightCm, this.userProfile.goal);
    return this.getProgress();
  }
}

// Global singleton instance
const globalForDb = globalThis as unknown as { db?: FitMasterDatabase };
export const db = globalForDb.db ?? new FitMasterDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
