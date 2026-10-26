/**
 * A client's onboarding profile: one per user, the single source of truth their trainers read (chat is only discussion).
 * Mirrors the backend ClientOnboardingResponse. Lists are always arrays; text answers are '' / null when empty.
 */
export interface ClientOnboarding {
  userId: number;
  clientName: string;
  /** False until the client saves their first step. */
  started: boolean;
  /** Share (0-100) of the required answers filled in. */
  completionPercent: number;
  complete: boolean;
  /** Keys of the required answers still missing, in wizard order. */
  missingRequired: string[];
  lastUpdate?: string | null;
  /** The wizard step (1-7) to resume at. */
  currentStep: number;

  // A. Training setup
  locationType?: string | null;
  centerId?: number | null;
  centerName?: string | null;
  gymName?: string | null;
  gymCity?: string | null;
  trainingMode?: string | null;
  equipment: string[];
  equipmentOther?: string | null;

  // B. Fitness level and history
  fitnessLevel?: string | null;
  yearsTraining?: string | null;
  sportsPlayed?: string | null;
  weeklyActivity?: string | null;
  benchmarks?: string | null;

  // C. Goals
  goals: string[];
  /** yyyy-MM-dd */
  targetDate?: string | null;
  successText?: string | null;

  // D. Health and safety (only the client and their trainers ever see these)
  injuries?: string | null;
  medicalConditions?: string | null;
  doctorClearance?: string | null;

  // E. Nutrition and supplements
  supplements: string[];
  supplementsOther?: string | null;
  dietPattern?: string | null;
  dietNotes?: string | null;
  allergies?: string | null;
  supplementGuidance?: string | null;

  // F. Schedule and preferences
  availableDays: string[];
  availableTimes: string[];
  sessionMinutes?: number | null;
  trainerModePref?: string | null;
  languagePref?: string | null;
  trainerGenderPref?: string | null;
  checkInPref?: string | null;

  // G. Admin
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  heardFrom?: string | null;

  message?: string;
}

/** What a save sends: only the answers of the step being saved (null/undefined = untouched, '' / [] = cleared). */
export type ClientOnboardingSave = Partial<Omit<ClientOnboarding,
  'userId' | 'clientName' | 'started' | 'completionPercent' | 'complete' | 'missingRequired' | 'lastUpdate' | 'centerName' | 'message'>>
  & { clearCenter?: boolean; clearTargetDate?: boolean };
