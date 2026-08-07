export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  status: string;
  date: Date;
  lastUpdate: Date;
  message?: string;
}
