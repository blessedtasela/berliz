/** BK-47: SENT -> COMPLETED (client signs) -> [EDIT_REQUESTED -> EDIT_GRANTED -> LOCKED]
 *  (super-admin-mediated reopen, repeatable). "Not sent" has no value here -- it's simply the
 *  absence of a ClientIntake row for that client. */
export type ClientIntakeStatus = 'SENT' | 'COMPLETED' | 'EDIT_REQUESTED' | 'EDIT_GRANTED' | 'LOCKED';

export interface ClientIntake {
  id: number;

  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;

  trainerId: number;
  trainerName: string;

  status: ClientIntakeStatus;

  medicalConditions: string;
  medications: string;
  injuriesOrLimitations: string;
  trainingHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  /** PAR-Q+ general health screening questions (GN-25) -- null until signed at least once. */
  parqHeartConditionOrHighBp: boolean | null;
  parqChestPain: boolean | null;
  parqDizzinessOrConsciousnessLoss: boolean | null;
  parqChronicMedicalCondition: boolean | null;
  parqPrescribedMedicationForCondition: boolean | null;
  parqBoneJointOrSoftTissueProblem: boolean | null;
  parqMedicallySupervisedActivityOnly: boolean | null;
  /** True if any PAR-Q question above was answered yes -- a soft flag, never a hard block. */
  requiresPhysicianClearance: boolean | null;

  /** Typed full-name attestation. Null until first signed. */
  signedName: string | null;
  /** Null until first signed. Was consentAcknowledgedAt before BK-47. */
  signedAt: Date | null;
  /** When the trainer sent this PAR-Q. Was submittedAt before BK-47. */
  sentAt: Date;
  lastUpdate: Date;

  message?: string;
}

export interface ClientIntakeAuditEntry {
  id: number;
  action: 'SENT' | 'SIGNED' | 'EDIT_REQUESTED' | 'EDIT_GRANTED' | 'EDIT_DENIED' | 'EDIT_SAVED' | 'ADMIN_EDITED';
  actorName?: string;
  reason?: string;
  date: Date;
}

/** The seven PAR-Q+ general health screening questions, in display order. Wording is seeded from
 *  the standard published instrument (GN-25) to the best of this implementation's knowledge --
 *  compliance/the owner should verify it against the currently-published PAR-Q+ before this is
 *  relied on as a real health-clearance instrument. */
export const PARQ_QUESTIONS: { key: keyof ClientIntake; text: string }[] = [
  { key: 'parqHeartConditionOrHighBp', text: 'Has a doctor ever said that you have a heart condition or high blood pressure?' },
  { key: 'parqChestPain', text: 'Do you feel pain in your chest at rest, during your daily activities, or when you do physical activity?' },
  { key: 'parqDizzinessOrConsciousnessLoss', text: 'Do you lose your balance because of dizziness, or have you lost consciousness in the last 12 months?' },
  { key: 'parqChronicMedicalCondition', text: 'Have you been diagnosed with another chronic medical condition (other than heart disease or high blood pressure)?' },
  { key: 'parqPrescribedMedicationForCondition', text: 'Are you currently taking prescribed medication for a chronic medical condition?' },
  { key: 'parqBoneJointOrSoftTissueProblem', text: 'Do you currently have, or have you had in the last 12 months, a bone, joint, or soft-tissue problem that could be made worse by becoming more physically active?' },
  { key: 'parqMedicallySupervisedActivityOnly', text: 'Has a doctor ever said that you should only do medically supervised physical activity?' },
];
