export interface Testimonials {
  id: number;
  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;
  centerId: number;
  centerName: string;
  trainerId: number;
  trainerName: string;
  clientId: number;
  clientName: string;
  testimonial: string;
  likes: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}
