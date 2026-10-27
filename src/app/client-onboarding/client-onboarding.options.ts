import { ClientOnboarding } from 'src/app/models/client-onboarding.model';

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

/** Wizard step titles, in order. The server's required answers each live on one of the first six. */
export const ONBOARDING_STEPS = [
  { n: 1, key: 'setup', title: 'Training setup', subtitle: 'Where and how you train' },
  { n: 2, key: 'level', title: 'Fitness level', subtitle: 'Where you are today' },
  { n: 3, key: 'goals', title: 'Your goals', subtitle: 'What you want out of training' },
  { n: 4, key: 'health', title: 'Health and safety', subtitle: 'So your trainer can plan safely' },
  { n: 5, key: 'nutrition', title: 'Nutrition', subtitle: 'Optional' },
  { n: 6, key: 'schedule', title: 'Schedule', subtitle: 'When you can train' },
  { n: 7, key: 'admin', title: 'A few last things', subtitle: 'Optional' },
] as const;

export const LOCATION_TYPES: Option[] = [
  { value: 'center', label: 'A gym or center on Berliz' },
  { value: 'other_gym', label: 'Another gym' },
  { value: 'home', label: 'At home' },
  { value: 'outdoors', label: 'Outdoors' },
  { value: 'none_yet', label: 'No fixed place yet' },
];

export const TRAINING_MODES: Option[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
  { value: 'hybrid', label: 'Both (hybrid)' },
];

export const EQUIPMENT: Option[] = [
  { value: 'dumbbells', label: 'Dumbbells' },
  { value: 'barbell', label: 'Barbell' },
  { value: 'squat_rack', label: 'Squat rack' },
  { value: 'bench', label: 'Bench' },
  { value: 'kettlebells', label: 'Kettlebells' },
  { value: 'resistance_bands', label: 'Resistance bands' },
  { value: 'pull_up_bar', label: 'Pull-up bar' },
  { value: 'treadmill', label: 'Treadmill' },
  { value: 'rowing_machine', label: 'Rowing machine' },
  { value: 'cable_machine', label: 'Cable machine' },
  { value: 'other_machines', label: 'Other machines' },
  { value: 'bodyweight_only', label: 'Bodyweight only' },
];

export const LEVELS: Option[] = [
  { value: 'beginner', label: 'Beginner', hint: 'Under 6 months of consistent training.' },
  { value: 'intermediate', label: 'Intermediate', hint: '6 months to 3 years of consistent training; you know the main lifts.' },
  { value: 'advanced', label: 'Advanced', hint: 'More than 3 years of consistent, structured training.' },
];

export const GOALS: Option[] = [
  { value: 'fat_loss', label: 'Fat loss' },
  { value: 'muscle_gain', label: 'Muscle gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'sport_performance', label: 'Sport performance' },
  { value: 'general_health', label: 'General health' },
  { value: 'injury_aware', label: 'Injury-aware training' },
];

export const SUPPLEMENTS: Option[] = [
  { value: 'protein', label: 'Protein' },
  { value: 'creatine', label: 'Creatine' },
  { value: 'pre_workout', label: 'Pre-workout' },
  { value: 'vitamins', label: 'Vitamins' },
  { value: 'other', label: 'Other' },
];

export const DIET_PATTERNS: Option[] = [
  { value: 'none', label: 'No restrictions' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'other', label: 'Other' },
];

export const SUPPLEMENT_GUIDANCE: Option[] = [
  { value: 'yes', label: 'Yes, I would like guidance' },
  { value: 'no', label: 'No' },
  { value: 'have_plan', label: 'I already have a plan' },
];

export const DAYS: Option[] = [
  { value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }, { value: 'wed', label: 'Wed' },
  { value: 'thu', label: 'Thu' }, { value: 'fri', label: 'Fri' }, { value: 'sat', label: 'Sat' }, { value: 'sun', label: 'Sun' },
];

export const TIMES: Option[] = [
  { value: 'morning', label: 'Morning', hint: 'Before noon' },
  { value: 'midday', label: 'Midday', hint: '11am to 2pm' },
  { value: 'afternoon', label: 'Afternoon', hint: '2pm to 5pm' },
  { value: 'evening', label: 'Evening', hint: 'After 5pm' },
];

export const SESSION_MINUTES = [30, 45, 60, 90];

export const TRAINER_MODE_PREFS: Option[] = [
  { value: 'in_person', label: 'In person' },
  { value: 'online', label: 'Online' },
  { value: 'no_preference', label: 'No preference' },
];

export const TRAINER_GENDER_PREFS: Option[] = [
  { value: 'woman', label: 'A woman' },
  { value: 'man', label: 'A man' },
  { value: 'no_preference', label: 'No preference' },
];

/** The label for a stored value, falling back to the value itself (so an unknown stored value is still shown). */
export function labelOf(options: Option[], value: string | null | undefined): string {
  if (!value) return '';
  return options.find(o => o.value === value)?.label ?? value;
}

export function labelsOf(options: Option[], values: string[] | null | undefined): string[] {
  return (values ?? []).map(v => labelOf(options, v));
}

/** An empty profile, for a client who has not started (and as the wizard's starting draft). */
export function emptyOnboarding(): ClientOnboarding {
  return {
    userId: 0, clientName: '', started: false, completionPercent: 0, complete: false, missingRequired: [], currentStep: 1,
    equipment: [], goals: [], supplements: [], availableDays: [], availableTimes: [],
  };
}

/** The server may send the target date as 'yyyy-MM-dd' or as a [y, m, d] array; the form always wants the string. */
export function normaliseDate(value: unknown): string | null {
  if (!value) return null;
  if (Array.isArray(value) && value.length >= 3) {
    const [y, m, d] = value as number[];
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  return String(value).slice(0, 10);
}

/** Fills the lists and date the server may leave out so the template never meets undefined. */
export function normaliseOnboarding(raw: Partial<ClientOnboarding> | null | undefined): ClientOnboarding {
  const base = emptyOnboarding();
  const o = { ...base, ...(raw ?? {}) } as ClientOnboarding;
  o.equipment = o.equipment ?? [];
  o.goals = o.goals ?? [];
  o.supplements = o.supplements ?? [];
  o.availableDays = o.availableDays ?? [];
  o.availableTimes = o.availableTimes ?? [];
  o.missingRequired = o.missingRequired ?? [];
  o.targetDate = normaliseDate(o.targetDate);
  o.currentStep = Math.min(7, Math.max(1, o.currentStep || 1));
  return o;
}
