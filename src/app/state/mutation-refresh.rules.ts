import { Action } from '@ngrx/store';

import * as BookingA from './booking/booking.actions';
import * as CategoryA from './category/category.actions';
import * as CenterA from './center/center.actions';
import * as ClientA from './client/client.actions';
import * as ClientIntakeA from './client-intake/client-intake.actions';
import * as ConnectionA from './connection/connection.actions';
import * as ContactUsA from './contact-us/contact-us.actions';
import * as ExerciseA from './exercise/exercise.actions';
import * as FaqA from './faq/faq.actions';
import * as MemberA from './member/member.actions';
import * as MuscleGroupA from './muscle-group/muscle-group.actions';
import * as NewsletterA from './newsletter/newsletter.actions';
import * as PartnerA from './partner/partner.actions';
import * as PaymentA from './payment/payment.actions';
import * as PayoutA from './payout/payout.actions';
import * as PlanA from './plan/plan.actions';
import * as ProgressEntryA from './progress-entry/progress-entry.actions';
import * as ProgressShareA from './progress-share/progress-share.actions';
import * as AvailabilityA from './availability/availability.actions';
import * as SubscriptionA from './subscription/subscription.actions';
import * as TagA from './tag/tag.actions';
import * as TaskA from './task/task.actions';
import * as TestimonialA from './testimonial/testimonial.actions';
import * as TodoA from './todo/todo.actions';
import * as TrainerA from './trainer/trainer.actions';
import * as UserA from './user/user.actions';
import * as WorkoutA from './workout/workout.actions';

export type Loader = () => Action;
export type RefreshRole = 'admin' | 'trainer' | 'center' | 'client' | 'user' | string;

interface RefreshRule {
  /** Matched against the request path (no origin), e.g. `/trainer/updateTrainerStatus/5`. First match wins. */
  path: RegExp;
  /** Full-list loaders: only for an admin (the others would be refused or answer an empty list for anyone else). */
  admin?: Loader[];
  /** Loaders for the signed-in user's own records, by role. */
  roles?: Partial<Record<'trainer' | 'center' | 'client', Loader[]>>;
  /** Public / own-account loaders that are safe for any signed-in user. */
  any?: Loader[];
}

/**
 * After a successful create / update / delete, which lists to re-fetch.
 *
 * Many components call the HTTP service directly instead of dispatching, so nothing in the store learns about
 * the change; they relied on the server's WebSocket broadcast to update the row on screen. When that push is
 * missed (socket reconnecting, server could not serialize the payload, a second tab) the change "succeeded" but
 * the list stayed stale until a manual refresh. Re-fetching here makes every such change show up straight away.
 *
 * Specific endpoints come before the general one for the same controller. An empty rule ({}) means "never
 * refresh" (likes and view counters change nothing a list shows).
 */
export const MUTATION_REFRESH_RULES: ReadonlyArray<RefreshRule> = [
  // ── Trainer ──────────────────────────────────────────────────────────────
  { path: /^\/trainer\/(like|likeTrainerReview|incrementFeatureVideoViews)\b/ },
  { path: /^\/trainer\/\w*Pricing/, admin: [TrainerA.loadTrainerPricing], roles: { trainer: [TrainerA.loadMyTrainerPricing] } },
  { path: /^\/trainer\/\w*Benefit/, admin: [TrainerA.loadTrainerBenefits], roles: { trainer: [TrainerA.loadMyTrainerBenefits] } },
  { path: /^\/trainer\/\w*Introduction/, admin: [TrainerA.loadTrainerIntroductions], roles: { trainer: [TrainerA.loadMyTrainerIntroduction] } },
  { path: /^\/trainer\/\w*PhotosAlbum/, admin: [TrainerA.loadTrainerPhotoAlbums], roles: { trainer: [TrainerA.loadMyTrainerPhotoAlbum] } },
  { path: /^\/trainer\/\w*VideosAlbum/, admin: [TrainerA.loadTrainerVideoAlbums], roles: { trainer: [TrainerA.loadMyTrainerVideoAlbum] } },
  { path: /^\/trainer\/\w*(FeatureVideo|FeaturedVideo)/, admin: [TrainerA.loadTrainerFeatureVideos], roles: { trainer: [TrainerA.loadMyTrainerFeatureVideos] } },
  { path: /^\/trainer\/\w*Review/, admin: [TrainerA.loadTrainerReviews], roles: { trainer: [TrainerA.loadMyTrainerReviews] } },
  {
    path: /^\/trainer\/\w*Subscription/,
    admin: [TrainerA.loadTrainerSubscriptions, TrainerA.loadActiveTrainerSubscriptions],
    roles: { trainer: [TrainerA.loadMyTrainerSubscription] }
  },
  {
    path: /^\/trainer\//,
    admin: [TrainerA.loadTrainers, TrainerA.loadActiveTrainers],
    roles: { trainer: [TrainerA.loadMyTrainer] },
    any: [TrainerA.loadActiveTrainers]
  },

  // ── Center ───────────────────────────────────────────────────────────────
  { path: /^\/center\/(like)\b/ },
  { path: /^\/center\/\w*Announcement/, admin: [CenterA.loadAllCenterAnnouncements], roles: { center: [CenterA.loadMyCenterAnnouncements] } },
  { path: /^\/center\/\w*Equipment/, admin: [CenterA.loadAllCenterEquipment], roles: { center: [CenterA.loadMyCenterEquipment] } },
  { path: /^\/center\/\w*Introduction/, admin: [CenterA.loadAllCenterIntroductions], roles: { center: [CenterA.loadMyCenterIntroductions] } },
  { path: /^\/center\/\w*Location/, admin: [CenterA.loadAllCenterLocations], roles: { center: [CenterA.loadMyCenterLocations] } },
  { path: /^\/center\/\w*PhotoAlbum/, admin: [CenterA.loadAllCenterPhotoAlbums], roles: { center: [CenterA.loadMyCenterPhotoAlbums] } },
  { path: /^\/center\/\w*VideoAlbum/, admin: [CenterA.loadAllCenterVideoAlbums], roles: { center: [CenterA.loadMyCenterVideoAlbums] } },
  { path: /^\/center\/\w*Pricing/, admin: [CenterA.loadAllCenterPricing], roles: { center: [CenterA.loadMyCenterPricing] } },
  { path: /^\/center\/\w*Review/, admin: [CenterA.loadAllCenterReviews], roles: { center: [CenterA.loadMyCenterReviews] } },
  { path: /^\/center\/\w*Trainer/, admin: [CenterA.loadAllCenterTrainers], roles: { center: [CenterA.loadMyCenterTrainers] } },
  {
    path: /^\/center\//,
    admin: [CenterA.loadCenters, CenterA.loadActiveCenters],
    roles: { center: [CenterA.loadCenter] },
    any: [CenterA.loadActiveCenters]
  },

  // ── Single-list entities ─────────────────────────────────────────────────
  { path: /^\/client\//, admin: [ClientA.loadClients, ClientA.loadActiveClients], roles: { client: [ClientA.loadMyClient] } },
  { path: /^\/partner\//, admin: [PartnerA.loadPartners, PartnerA.loadActivePartners], any: [PartnerA.loadMyPartner] },
  { path: /^\/member\//, admin: [MemberA.loadMembers, MemberA.loadActiveMembers] },
  { path: /^\/faq\//, admin: [FaqA.loadFaqs], any: [FaqA.loadActiveFaqs] },
  { path: /^\/testimonial\//, admin: [TestimonialA.loadTestimonials], any: [TestimonialA.loadActiveTestimonials] },
  { path: /^\/category\/like/ },
  { path: /^\/category\//, admin: [CategoryA.loadCategories], any: [CategoryA.loadActiveCategories] },
  { path: /^\/exercise\//, admin: [ExerciseA.loadExercises], any: [ExerciseA.loadActiveExercises] },
  { path: /^\/muscleGroup\//, admin: [MuscleGroupA.loadMuscleGroups], any: [MuscleGroupA.loadActiveMuscleGroups] },
  { path: /^\/newsletter\//, admin: [NewsletterA.loadNewsletters, NewsletterA.loadActiveNewsletters] },
  { path: /^\/contactUs\//, admin: [ContactUsA.loadContactUs] },
  { path: /^\/tag\//, admin: [TagA.loadTags], any: [TagA.loadActiveTags] },
  { path: /^\/todoList\//, admin: [TodoA.loadTodos], any: [TodoA.loadMyTodos] },
  { path: /^\/task\//, admin: [TaskA.loadTasks, TaskA.loadActiveTasks], roles: { trainer: [TaskA.loadTrainerTasks], client: [TaskA.loadClientTasks] } },
  { path: /^\/plan\//, any: [PlanA.loadPlans] },
  { path: /^\/payout\//, admin: [PayoutA.loadAllPayouts], any: [PayoutA.loadMyPayouts] },
  { path: /^\/payment\/stripe\// },
  { path: /^\/payment\//, admin: [PaymentA.loadPayments, PaymentA.loadActivePayments], any: [PaymentA.loadMyPayments] },
  {
    path: /^\/subscription\//,
    admin: [SubscriptionA.loadSubscriptions, SubscriptionA.loadActiveSubscriptions],
    any: [SubscriptionA.loadMySubscriptions]
  },
  { path: /^\/user\/(login|signup|refreshToken|forgotPassword|resetPassword|activateAccount|checkToken)/ },
  { path: /^\/user\//, admin: [UserA.loadAllUsers, UserA.loadActiveUsers], any: [UserA.loadUser] },

  // ── The signed-in user's own data ────────────────────────────────────────
  {
    path: /^\/booking\//,
    admin: [BookingA.loadAllBookings],
    roles: { trainer: [BookingA.loadMyProviderBookings], center: [BookingA.loadMyProviderBookings] },
    any: [BookingA.loadMyBookings]
  },
  {
    path: /^\/workout\//,
    any: [WorkoutA.loadMyWorkouts, WorkoutA.loadWorkoutTemplates, WorkoutA.loadMyAssignedWorkouts, WorkoutA.loadAssignmentsIMade]
  },
  { path: /^\/connection\//, any: [ConnectionA.loadMyConnections, ConnectionA.loadPendingRequests] },
  { path: /^\/progress-entry\//, any: [ProgressEntryA.loadMyProgressEntries] },
  { path: /^\/progress-share\//, any: [ProgressShareA.loadMyGrants, ProgressShareA.loadSharedWithMe] },
  { path: /^\/client-intake\//, any: [ClientIntakeA.loadMyClientIntakes] },
  { path: /^\/availability\//, roles: { trainer: [AvailabilityA.loadMyAvailability], center: [AvailabilityA.loadMyAvailability] } },
];

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/** The list loaders to dispatch for one request, or [] when nothing should refresh. Pure, so it is easy to test. */
export function resolveReloads(method: string, path: string, role: RefreshRole | null): Loader[] {
  if (!MUTATING.has(method.toUpperCase())) return [];
  const rule = MUTATION_REFRESH_RULES.find(r => r.path.test(path));
  if (!rule) return [];

  const loaders: Loader[] = [...(rule.any ?? [])];
  const normalized = (role ?? '').toLowerCase();
  if (normalized === 'admin') loaders.push(...(rule.admin ?? []));
  const own = rule.roles?.[normalized as 'trainer' | 'center' | 'client'];
  if (own) loaders.push(...own);

  const seen = new Set<string>();
  return loaders.filter(load => {
    const type = load().type;
    if (seen.has(type)) return false;
    seen.add(type);
    return true;
  });
}
