import { matchesMode, ProviderMode } from 'src/app/shared/provider-profile/provider-filters';

/**
 * What Berliz offers — the content of the Services page and of each service's detail page. These are the real
 * services (how and where you train, and the shop to come); the browsable training styles — Boxing, Yoga,
 * Powerlifting… — are Disciplines and have their own pages. Keep this copy in step with the mobile app's
 * `utils/berliz-services.ts`.
 */
export type ServiceSlug = 'online-training' | 'hybrid-training' | 'in-person-training' | 'gyms-and-centers' | 'shop';

export interface ServiceStep {
  title: string;
  text: string;
}

export interface BerlizService {
  slug: ServiceSlug;
  title: string;
  /** One line for the card. */
  tagline: string;
  /** A Feather icon registered in IconsModule. */
  icon: 'monitor' | 'shuffle' | 'map-pin' | 'home' | 'shopping-bag';
  /** The paragraph at the top of the detail page. */
  summary: string;
  steps: ServiceStep[];
  benefits: string[];
  bestFor: string[];
  /** Which providers the page lists: trainers who offer this mode, centers, or nobody yet. */
  audience: 'trainers' | 'centers' | 'none';
  /** For a training mode: the directory filter it maps to. */
  mode?: ProviderMode;
  comingSoon?: boolean;
  /** The main button's wording. */
  ctaLabel: string;
}

export const BERLIZ_SERVICES: BerlizService[] = [
  {
    slug: 'online-training',
    title: 'Online personal training',
    tagline: 'A certified coach, wherever you are.',
    icon: 'monitor',
    summary:
      'Train one-to-one with a Berliz-certified coach without leaving home. Sessions run online at times that suit you, and your coach builds the plan around your goals, your schedule and the equipment you have.',
    steps: [
      { title: 'Pick a coach', text: 'Browse trainers who coach online, see their rates, reviews and open hours.' },
      { title: 'Book or buy a pack', text: 'Request a single session, or buy a session pack or membership if you want to train regularly.' },
      { title: 'Train and track', text: 'Do your session, then log your workouts and progress in the app and keep in touch with your coach.' },
    ],
    benefits: [
      'No travel time — train from home, a hotel or the park',
      'Coaches from anywhere, not just your city',
      'Flexible slots, including early mornings and evenings',
      'Often a lower hourly rate than in-person sessions',
    ],
    bestFor: ['Busy schedules', 'Frequent travellers', 'Training at home', 'Anyone who prefers privacy'],
    audience: 'trainers',
    mode: 'ONLINE',
    ctaLabel: 'Find online trainers',
  },
  {
    slug: 'hybrid-training',
    title: 'Hybrid training',
    tagline: 'The best of both: some sessions in person, some online.',
    icon: 'shuffle',
    summary:
      'Meet your coach in person when it matters — technique, testing, heavy days — and train online the rest of the week. One coach, one plan, and the flexibility to switch between the two as life gets in the way.',
    steps: [
      { title: 'Choose a hybrid coach', text: 'These trainers offer both in-person and online sessions, so one booking relationship covers both.' },
      { title: 'Plan your mix', text: 'Agree with your coach which sessions happen face to face and which happen online.' },
      { title: 'Stay on one plan', text: 'Your workouts, progress and messages live in one place whichever way you trained.' },
    ],
    benefits: [
      'Hands-on coaching without needing every session in person',
      'Keep training when you travel or your schedule changes',
      'One coach and one history of your progress',
      'Mix the formats to fit your budget',
    ],
    bestFor: ['Technique-focused lifters', 'People who travel for work', 'Anyone easing back into training'],
    audience: 'trainers',
    mode: 'HYBRID',
    ctaLabel: 'Find hybrid trainers',
  },
  {
    slug: 'in-person-training',
    title: 'In-person personal training',
    tagline: 'Face-to-face coaching at a gym, a park or your own place.',
    icon: 'map-pin',
    summary:
      'Nothing beats a coach standing next to you. Choose a trainer near you, pick the gym, park or studio they work from — or, where they offer it, have them come to your own place — and train one-to-one.',
    steps: [
      { title: 'Find a trainer near you', text: 'See the cities and spots each trainer covers, with addresses and any extra fee for a location.' },
      { title: 'Pick a time and a place', text: 'Choose from their open hours and where you want to train. The price is shown before you send the request.' },
      { title: 'Confirm, pay, train', text: 'Your trainer accepts, you pay securely within 24 hours, and you show up. Free cancellation applies before the cutoff.' },
    ],
    benefits: [
      'Live feedback on form and technique',
      'Train at a gym, a park, or at your own place where offered',
      'Clear pricing, including any location fee, before you book',
      "Cancel free before the trainer's cutoff",
    ],
    bestFor: ['Beginners learning the basics', 'Strength and technique work', 'People who need accountability'],
    audience: 'trainers',
    mode: 'IN_PERSON',
    ctaLabel: 'Find in-person trainers',
  },
  {
    slug: 'gyms-and-centers',
    title: 'Gyms & training centers',
    tagline: 'Connect with the right place to train.',
    icon: 'home',
    summary:
      'Berliz connects you with gyms and training centers: see what each one offers, the equipment on the floor, the trainers who work there, their locations and pricing — then book a session or join.',
    steps: [
      { title: 'Browse centers', text: 'Compare centers by the disciplines they run, their locations and what they charge.' },
      { title: 'Look inside', text: 'See the equipment, announcements, photos and the trainers affiliated with each center.' },
      { title: 'Book or join', text: 'Send a booking request, or buy a membership or session pack from the center.' },
    ],
    benefits: [
      'See the equipment before you walk in',
      'Meet the trainers affiliated with each center',
      'Memberships and packs with clear prices',
      'Reviews and testimonials from real members',
    ],
    bestFor: ['Anyone looking for a new gym', 'Groups and classes', 'People who want trainers and facilities in one place'],
    audience: 'centers',
    ctaLabel: 'Browse centers',
  },
  {
    slug: 'shop',
    title: 'Shop',
    tagline: 'Training essentials — coming soon.',
    icon: 'shopping-bag',
    summary:
      'We are building a shop for the things that make training easier: gear and essentials from partners we trust. It is not open yet — the first products will appear here when it is.',
    steps: [
      { title: 'Browse', text: 'Find gear and essentials alongside your training.' },
      { title: 'Order', text: 'Check out securely inside Berliz.' },
      { title: 'Delivered', text: 'Track your order from the same place you track your workouts.' },
    ],
    benefits: ['Curated, not endless', 'One account for training and shopping', 'Secure checkout'],
    bestFor: ['Everyone who trains with Berliz'],
    audience: 'none',
    comingSoon: true,
    ctaLabel: 'Coming soon',
  },
];

export function findService(slug: string | null | undefined): BerlizService | undefined {
  const s = (slug ?? '').trim().toLowerCase();
  return BERLIZ_SERVICES.find(x => x.slug === s);
}

/** Trainers a training-mode service should list: those who offer that mode (a hybrid coach also does in-person and online). */
export function trainersForService<T extends { serviceMode?: string | null }>(service: BerlizService, trainers: T[]): T[] {
  if (service.audience !== 'trainers' || !service.mode) return [];
  return trainers.filter(t => matchesMode(t, service.mode!));
}
