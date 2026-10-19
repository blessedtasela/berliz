import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, catchError, of, take, takeUntil } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { CenterService } from 'src/app/services/center.service';
import { ProviderPackageService } from 'src/app/services/provider-package.service';
import { SeoService } from 'src/app/services/seo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Users } from 'src/app/models/users.interface';
import {
  PLAN_KIND_BLURB, PLAN_KIND_LABEL, PlanGroup, groupPlansByKind, planActionLabel, planCheckoutNote, planIncludes, planKind, planPriceNote,
} from 'src/app/utils/provider-package.util';
import { environment } from 'src/environments/environment';
import { clearGuestDraft, loadGuestDraft, saveGuestDraft } from '../guest-booking-draft';
import { ProviderKind, providerSlug, resolveProviderBySlug } from '../resolve-provider';

/**
 * **Level Up** — `/trainers/:name/level-up` and `/centers/:name/level-up`. Where a client commits to a
 * provider for more than one session: subscribe (billed monthly), buy a session pack, or get a
 * membership. There is nothing to schedule here — you pay, it lands in My Subscriptions, and you book
 * your sessions out of it on the provider's booking page (`/book?plan=<id>`). A single session with no
 * commitment is the booking page's job; this page links to it.
 *
 * `?plan=<id>` opens the page with that plan already selected (the plan cards link here).
 */
@Component({
  selector: 'app-level-up-page',
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './level-up-page.component.html'
})
export class LevelUpPageComponent implements OnInit, OnDestroy {

  /** Set via route `data: { kind: 'trainer' | 'center' }` -- see trainers-feature.module.ts / centers-feature.module.ts. */
  kind: ProviderKind = 'trainer';

  resolving = true;
  notFound = false;
  plansLoaded = false;

  providerId = 0;
  providerName = '';
  providerPhotoUrl: string | null = null;

  plans: ProviderPackage[] = [];
  groups: PlanGroup[] = [];
  /** This client's own ACTIVE purchases of one of this provider's plans, keyed by plan id. */
  ownedByPlanId = new Map<number, Subscriptions>();

  selectedPlan: ProviderPackage | null = null;
  buyingPlanId: number | null = null;
  /** The plan the link asked for (`?plan=`); used once the provider's plans have loaded. */
  private pendingPlanId: number | null = null;

  /** A visitor who is not signed in asked to pay: show the log in / create account choice. */
  showAuthPrompt = false;

  readonly kindLabel = (plan: ProviderPackage) => PLAN_KIND_LABEL[planKind(plan)];
  readonly kindBlurb = (kind: PlanGroup['kind']) => PLAN_KIND_BLURB[kind];
  readonly kindTitle = (kind: PlanGroup['kind']) => PLAN_KIND_LABEL[kind];
  readonly actionLabel = planActionLabel;
  readonly priceNote = planPriceNote;
  readonly includes = planIncludes;
  readonly checkoutNote = planCheckoutNote;

  private user: Users | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private trainerService: TrainerService,
    private centerService: CenterService,
    private providerPackageService: ProviderPackageService,
    private subscriptionService: SubscriptionService,
    private stripeService: StripeService,
    private authRedirect: AuthRedirectService,
    private snackBar: SnackBarService,
    private seoService: SeoService,
  ) { }

  get isGuest(): boolean {
    return !this.user?.email;
  }

  get bookPath(): string[] {
    return [this.kind === 'trainer' ? '/trainers' : '/centers', providerSlug(this.providerName), 'book'];
  }

  get profilePath(): string[] {
    return [this.kind === 'trainer' ? '/trainers' : '/centers', providerSlug(this.providerName)];
  }

  isOwned(plan: ProviderPackage): boolean {
    return this.ownedByPlanId.has(plan.id);
  }

  ownedFrom(plan: ProviderPackage): Subscriptions | undefined {
    return this.ownedByPlanId.get(plan.id);
  }

  /** "3 left" on a pack you own; nothing for an unlimited one. */
  sessionsLeft(plan: ProviderPackage): string {
    const left = this.ownedFrom(plan)?.sessionsRemaining;
    return left == null ? 'Unlimited' : `${left} left`;
  }

  /** The main button says what it does and what it costs: "Subscribe · $99 / month", "Buy pack · $200". */
  get buyLabel(): string {
    const plan = this.selectedPlan;
    if (!plan) return '';
    if (this.buyingPlanId === plan.id) return 'Starting checkout…';
    if (this.isGuest) return 'Continue';
    return `${planActionLabel(plan)} · $${plan.price}${planKind(plan) === 'subscription' ? ' / month' : ''}`;
  }

  get buyBusy(): boolean {
    return this.buyingPlanId != null;
  }

  ngOnInit(): void {
    const planParam = Number(this.route.snapshot.queryParamMap.get('plan'));
    this.pendingPlanId = Number.isFinite(planParam) && planParam > 0 ? planParam : null;
    this.kind = (this.route.snapshot.data['kind'] as ProviderKind) ?? 'trainer';

    this.store.dispatch(loadUser());
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      const wasGuest = this.isGuest;
      this.user = user;
      if (!user?.email) return;
      // Back from sign-in / sign-up: the draft only existed to bring them here, so drop it.
      if (this.providerId && loadGuestDraft(this.kind, this.providerId)) clearGuestDraft();
      // The profile can arrive after the plans did: fetch what they own now.
      if (wasGuest && this.providerId) this.fetchOwned();
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => this.resolveProvider(params.get('name')));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Resolution ───────────────────────────────────────────────────────────

  private resolveProvider(name: string | null): void {
    this.resolving = true;
    this.notFound = false;

    resolveProviderBySlug(this.kind, name, this.trainerService, this.centerService)
      .pipe(take(1))
      .subscribe(provider => {
        this.resolving = false;
        if (!provider) {
          this.notFound = true;
          return;
        }
        this.providerId = provider.id;
        this.providerName = provider.name;
        this.providerPhotoUrl = provider.photoUrl;

        this.updateSeoTags();
        this.fetchPlans();
        if (this.user?.email) {
          this.fetchOwned();
          if (loadGuestDraft(this.kind, this.providerId)) clearGuestDraft();
        }
      });
  }

  private fetchPlans(): void {
    const plans$ = this.kind === 'trainer'
      ? this.providerPackageService.getForTrainer(this.providerId)
      : this.providerPackageService.getForCenter(this.providerId);

    plans$.pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.plans = [...(res?.data ?? [])]
        .filter(p => p.isActive)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      this.groups = groupPlansByKind(this.plans);
      this.plansLoaded = true;
      this.preselectPlan();
    });
  }

  private fetchOwned(): void {
    this.subscriptionService.getMySubscriptions().pipe(take(1), catchError(() => of([]))).subscribe(subs => {
      const owned = new Map<number, Subscriptions>();
      for (const sub of subs ?? []) {
        const planId = sub.providerPackage?.id;
        if (planId == null || sub.status !== 'true') continue;
        const sameProvider = this.kind === 'trainer'
          ? (sub.trainer as any)?.id === this.providerId
          : (sub.center as any)?.id === this.providerId;
        if (sameProvider) owned.set(planId, sub);
      }
      this.ownedByPlanId = owned;
    });
  }

  /** Opens on the plan the link named, if it's one of this provider's active plans (once, so a later pick sticks). */
  private preselectPlan(): void {
    const id = this.pendingPlanId;
    if (id == null || this.plans.length === 0) return;
    const plan = this.plans.find(p => p.id === id);
    if (!plan) return;
    this.pendingPlanId = null;
    this.selectedPlan = plan;
  }

  // ── Sharing / SEO ────────────────────────────────────────────────────────

  private get levelUpPath(): string {
    return `${this.kind === 'trainer' ? '/trainers' : '/centers'}/${providerSlug(this.providerName)}/level-up`;
  }

  private get shareUrl(): string {
    return `${environment.baseUrl}${this.levelUpPath}`;
  }

  /** Native share sheet where the browser has one (phones), otherwise copy the link. */
  async share(): Promise<void> {
    const url = this.shareUrl;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Level up with ${this.providerName} | Berliz`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      this.snackBar.openSnackBar('Link copied', '');
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      this.snackBar.openSnackBar('Could not share the link', 'error');
    }
  }

  private updateSeoTags(): void {
    this.seoService.updatePageData({
      title: `Level up with ${this.providerName} | Berliz`,
      description: `Subscribe, buy a session pack or get a membership with ${this.providerName} on Berliz.`,
      imageUrl: this.providerPhotoUrl || `${environment.assetsUrl}berliz-site.png`,
      ogType: 'website',
    }, this.shareUrl);
  }

  // ── Choosing and paying ──────────────────────────────────────────────────

  choose(plan: ProviderPackage): void {
    this.selectedPlan = plan;
    setTimeout(() => document.getElementById('level-up-checkout')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  /** The pay button. Starts Stripe Checkout; booking the sessions happens afterwards, once it's paid. */
  buy(): void {
    const plan = this.selectedPlan;
    if (!plan || this.buyingPlanId != null || this.isOwned(plan)) return;

    if (this.isGuest) {
      this.promptToSignIn();
      return;
    }

    this.buyingPlanId = plan.id;
    this.subscriptionService.purchasePackage(plan.id).subscribe({
      next: res => {
        const purchase = res?.data;
        if (!purchase?.subscriptionId) {
          this.buyingPlanId = null;
          this.snackBar.openSnackBar(res?.message || 'Could not start that purchase — try again.', 'error');
          return;
        }
        this.stripeService.createCheckoutSession({
          subscriptionId: purchase.subscriptionId,
          amount: purchase.price,
          currency: purchase.currency,
          productName: purchase.packageName,
          // A subscription is charged again every month; a pack or membership is paid once.
          recurring: planKind(plan) === 'subscription',
        }).subscribe({
          next: checkoutRes => {
            const checkoutUrl = checkoutRes.data?.checkoutUrl;
            if (!checkoutUrl) {
              this.buyingPlanId = null;
              this.snackBar.openSnackBar('Could not start checkout — try again.', 'error');
              return;
            }
            window.location.href = checkoutUrl;
          },
          error: () => {
            this.buyingPlanId = null;
            this.snackBar.openSnackBar('Could not start checkout — try again.', 'error');
          }
        });
      },
      error: err => {
        this.buyingPlanId = null;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not start that purchase — try again.', 'error');
      }
    });
  }

  // ── Guest hand-off ───────────────────────────────────────────────────────

  /** Remember the pick, then let the visitor choose between logging in and creating an account. */
  promptToSignIn(): void {
    this.saveDraft();
    this.showAuthPrompt = true;
  }

  dismissAuthPrompt(): void {
    this.showAuthPrompt = false;
  }

  goToLogin(): void {
    this.saveDraft();
    this.authRedirect.goToLogin();
  }

  goToSignUp(): void {
    this.saveDraft();
    this.router.navigate(['/sign-up']);
  }

  /** The guest-draft slot also carries "where to land after sign-in", which is all this page needs from it. */
  private saveDraft(): void {
    saveGuestDraft({
      kind: this.kind,
      providerId: this.providerId,
      date: new Date().toISOString().slice(0, 10),
      slotStart: null,
      notes: '',
      path: this.levelUpPath + (this.selectedPlan ? `?plan=${this.selectedPlan.id}` : ''),
    });
  }
}
