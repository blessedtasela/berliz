import { Centers } from "./centers.interface";
import { Users } from "./users.interface";

export interface Testimonials {
  id: number;
  user: Users;
  center: Centers;
  testimonial: string;
  status: string;
  date: Date;
  lastUpdate: Date;
}