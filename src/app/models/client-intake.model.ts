export interface ClientIntake {
  id: number;

  clientId: number;
  clientFirstname: string;
  clientLastname: string;
  clientEmail: string;

  trainerId: number;
  trainerName: string;

  medicalConditions: string;
  medications: string;
  injuriesOrLimitations: string;
  trainingHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  /** Set once the consent checkbox has been acknowledged; null until then. */
  consentAcknowledgedAt: Date | null;

  submittedAt: Date;
  lastUpdate: Date;

  message?: string;
}
