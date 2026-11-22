/**
 * GN-75 Phase 2's 5-question "tell us about your goals" quiz -- feeds the
 * future recommended-trainers/recommended-workout feed sections. Named
 * "profile quiz" everywhere in the frontend (not "onboarding") specifically
 * to not collide with the unrelated, pre-existing client-onboarding feature
 * (trainer intake of a new client) -- see client-onboarding.model.ts.
 * Mirrors the backend's Onboarding* DTOs (the backend's own naming is fine:
 * its REST path is /onboarding and /admin/onboarding-questions, distinct
 * from client-onboarding's /client-onboarding).
 */
export interface ProfileQuizOption {
  id: number;
  text: string;
  displayOrder: number;
}

export interface ProfileQuizQuestion {
  id: number;
  text: string;
  displayOrder: number;
  active: boolean;
  options: ProfileQuizOption[];
  /** This user's existing answer, if any -- lets the wizard prefill it. */
  answeredOptionId?: number | null;
}

export interface ProfileQuizStatus {
  completed: boolean;
  totalQuestions: number;
  answeredCount: number;
}

export interface ProfileQuizAnswerInput {
  questionId: number;
  optionId: number;
}

// ── Admin (question bank management) ────────────────────────────────────────

export interface ProfileQuizOptionAdminRequest {
  id?: number | null; // omit/null for a new option
  text: string;
  displayOrder: number;
}

export interface ProfileQuizQuestionAdminRequest {
  id?: number | null; // omit/null for create
  text: string;
  displayOrder: number;
  active: boolean;
  options: ProfileQuizOptionAdminRequest[];
}
