import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  take,
  takeUntil
} from 'rxjs';

// ── PUBLIC ENTITIES ───────────────────────────────────────────────────────────
import { loadActiveTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import {
  loadActiveCenters,
  loadAllCenterEquipment
} from 'src/app/state/center/center.actions';
import {
  selectActiveCenters,
  selectCenterEquipment
} from 'src/app/state/center/center.selectors';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { loadActiveTestimonials } from 'src/app/state/testimonial/testimonial.actions';
import { selectActiveTestimonials } from 'src/app/state/testimonial/testimonial.selectors';

// ── ADMIN ENTITIES ────────────────────────────────────────────────────────────
import { loadAllUsers } from 'src/app/state/user/user.actions';
import { selectUser, selectUsers } from 'src/app/state/user/user.selector';
import { loadTasks } from 'src/app/state/task/task.actions';
import { selectTasks } from 'src/app/state/task/task.selectors';
import { loadPayments } from 'src/app/state/payment/payment.actions';
import { selectPayments } from 'src/app/state/payment/payment.selectors';
import { loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';
import { loadContactUs } from 'src/app/state/contact-us/contact-us.actions';
import { selectContactUsList } from 'src/app/state/contact-us/contact-us.selectors';
import { loadNewsletters } from 'src/app/state/newsletter/newsletter.actions';
import { selectNewsletters } from 'src/app/state/newsletter/newsletter.selectors';
import { loadTags } from 'src/app/state/tag/tag.actions';
import { selectTags } from 'src/app/state/tag/tag.selectors';
import { loadMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';

export interface GlobalSearchItem {
  id: number | string;
  label: string;
  sublabel?: string;
  link: any[];
}

export interface GlobalSearchGroup {
  key: string;
  label: string;
  icon: string;
  items: GlobalSearchItem[];
}

/**
 * One descriptor per searchable entity.
 *
 * `select` / `load` intentionally reuse the store logic that already exists —
 * global search does NOT hit a dedicated backend search endpoint. Everything is
 * filtered client-side off data the app can already load.
 */
interface SearchSource {
  key: string;
  label: string;
  icon: string;
  adminOnly: boolean;
  load: any;
  select: any;
  match: (entity: any, query: string) => boolean;
  toItem: (entity: any) => GlobalSearchItem;
}

const has = (value: any, query: string): boolean =>
  !!value && String(value).toLowerCase().includes(query);

const slug = (name: string): string => (name || '').trim().replace(/\s+/g, '-');

const truncate = (text: string, max = 80): string => {
  const value = (text || '').trim();
  return value.length > max ? `${value.slice(0, max)}…` : value;
};

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrls: ['./global-search.component.css']
})
export class GlobalSearchComponent implements OnInit, OnDestroy {

  /**
   * Fired whenever the user actually engages the search (focus, or the mobile
   * trigger calling `focusInput()`). The top bar listens for this to flip into
   * its full-width mobile search mode.
   */
  @Output() activated = new EventEmitter<void>();

  /**
   * Fired when the user is done searching — escape, or navigating to a result.
   * Deliberately NOT fired from the outside-click handler: the mobile trigger
   * button lives outside this component, so its click bubbles to the document
   * listener and would dismiss the mode in the same tick it was opened.
   */
  @Output() dismissed = new EventEmitter<void>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  query = '';
  activeQuery = '';
  open = false;
  loading = false;
  groups: GlobalSearchGroup[] = [];

  /** Groups the user expanded via "See all N results". */
  expanded = new Set<string>();

  /** How many rows of a group are shown before the "See all" affordance. */
  readonly previewCount = 4;

  private isAdmin = false;
  private primed = new Set<string>();
  private query$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  private readonly sources: SearchSource[] = [

    // ── PUBLIC ────────────────────────────────────────────────────────────
    {
      key: 'trainers',
      label: 'Trainers',
      icon: 'user',
      adminOnly: false,
      load: loadActiveTrainers(),
      select: selectActiveTrainers,
      match: (t, q) => has(t?.name, q),
      toItem: t => ({
        id: t.id,
        label: t.name,
        sublabel: t.address || t.motto,
        link: ['/trainers', slug(t.name)]
      })
    },
    {
      key: 'centers',
      label: 'Centers',
      icon: 'home',
      adminOnly: false,
      load: loadActiveCenters(),
      select: selectActiveCenters,
      match: (c, q) => has(c?.name, q),
      toItem: c => ({
        id: c.id,
        label: c.name,
        sublabel: c.address || c.location,
        link: ['/centers', c.id, slug(c.name)]
      })
    },
    {
      key: 'categories',
      label: 'Services',
      icon: 'layers',
      adminOnly: false,
      load: loadActiveCategories(),
      select: selectActiveCategories,
      match: (c, q) => has(c?.name, q),
      toItem: c => ({
        id: c.id,
        label: c.name,
        sublabel: truncate(c.description, 60),
        link: ['/services', c.id, c.name]
      })
    },
    {
      key: 'exercises',
      label: 'Exercises',
      icon: 'activity',
      adminOnly: false,
      load: loadActiveExercises(),
      select: selectActiveExercises,
      match: (e, q) => has(e?.name, q),
      toItem: e => ({
        id: e.id,
        label: e.name,
        sublabel: (e.muscleGroups || []).map((m: any) => m?.name).filter(Boolean).join(', '),
        link: ['/dashboard/exercises']
      })
    },
    {
      key: 'testimonials',
      label: 'Testimonials',
      icon: 'message-square',
      adminOnly: false,
      load: loadActiveTestimonials(),
      select: selectActiveTestimonials,
      match: (t, q) => has(t?.testimonial, q),
      toItem: t => ({
        id: t.id,
        label: truncate(t.testimonial),
        sublabel: t.clientName || t.trainerName || t.centerName,
        // Testimonials have no standalone route — deep-link to the trainer
        // they belong to, otherwise fall back to the services page.
        link: t.trainerName ? ['/trainers', slug(t.trainerName)] : ['/services']
      })
    },
    {
      key: 'equipment',
      label: 'Equipment',
      icon: 'package',
      adminOnly: false,
      load: loadAllCenterEquipment(),
      select: selectCenterEquipment,
      match: (e, q) => has(e?.name, q),
      toItem: e => ({
        id: e.id,
        label: e.name,
        sublabel: e.centerName,
        link: ['/equipments']
      })
    },

    // ── ADMIN ONLY ────────────────────────────────────────────────────────
    {
      key: 'users',
      label: 'Users',
      icon: 'users',
      adminOnly: true,
      load: loadAllUsers(),
      select: selectUsers,
      match: (u, q) =>
        has(`${u?.firstname || ''} ${u?.lastname || ''}`, q) || has(u?.email, q),
      toItem: u => ({
        id: u.id,
        label: `${u.firstname || ''} ${u.lastname || ''}`.trim() || u.email,
        sublabel: u.email,
        link: ['/dashboard/hub/users']
      })
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: 'check-square',
      adminOnly: true,
      load: loadTasks(),
      select: selectTasks,
      match: (t, q) => has(t?.description, q) || has(t?.trainerName, q),
      toItem: t => ({
        id: t.id,
        label: truncate(t.description, 60),
        sublabel: t.trainerName,
        link: ['/dashboard/hub/tasks']
      })
    },
    {
      key: 'payments',
      label: 'Payments',
      icon: 'credit-card',
      adminOnly: true,
      load: loadPayments(),
      select: selectPayments,
      match: (p, q) =>
        has(p?.userEmail, q) ||
        has(p?.payerEmail, q) ||
        has(`${p?.userFirstname || ''} ${p?.userLastname || ''}`, q),
      toItem: p => ({
        id: p.id,
        label:
          `${p.userFirstname || ''} ${p.userLastname || ''}`.trim() ||
          p.userEmail ||
          `Payment #${p.id}`,
        sublabel: p.paymentMethod,
        link: ['/dashboard/hub/payments']
      })
    },
    {
      key: 'subscriptions',
      label: 'Subscriptions',
      icon: 'star',
      adminOnly: true,
      load: loadSubscriptions(),
      select: selectSubscriptions,
      match: (s, q) =>
        has(`${s?.user?.firstname || ''} ${s?.user?.lastname || ''}`, q) ||
        has(s?.user?.email, q) ||
        has(s?.plan, q) ||
        has(s?.trainer?.name, q) ||
        has(s?.center?.name, q),
      toItem: s => ({
        id: s.id,
        label:
          `${s?.user?.firstname || ''} ${s?.user?.lastname || ''}`.trim() ||
          s?.user?.email ||
          `Subscription #${s.id}`,
        sublabel: [s?.plan, s?.trainer?.name || s?.center?.name]
          .filter(Boolean)
          .join(' · '),
        link: ['/dashboard/hub/subscriptions']
      })
    },
    {
      key: 'partners',
      label: 'Partners',
      icon: 'briefcase',
      adminOnly: true,
      load: loadPartners(),
      select: selectPartners,
      match: (p, q) =>
        has(`${p?.firstname || ''} ${p?.lastname || ''}`, q) || has(p?.email, q),
      toItem: p => ({
        id: p.id,
        label: `${p.firstname || ''} ${p.lastname || ''}`.trim() || p.email,
        sublabel: p.role || p.email,
        link: ['/dashboard/hub/partners']
      })
    },
    {
      key: 'contactUs',
      label: 'Contact Us',
      icon: 'inbox',
      adminOnly: true,
      load: loadContactUs(),
      select: selectContactUsList,
      match: (c, q) => has(c?.name, q) || has(c?.email, q) || has(c?.message, q),
      toItem: c => ({
        id: c.id,
        label: c.name || c.email,
        sublabel: truncate(c.message, 60),
        link: ['/dashboard/hub/contact-us']
      })
    },
    {
      key: 'newsletters',
      label: 'Newsletters',
      icon: 'mail',
      adminOnly: true,
      load: loadNewsletters(),
      select: selectNewsletters,
      match: (n, q) => has(n?.email, q),
      toItem: n => ({
        id: n.id,
        label: n.email,
        sublabel: n.status,
        link: ['/dashboard/hub/newsletters']
      })
    },
    {
      key: 'tags',
      label: 'Tags',
      icon: 'bookmark',
      adminOnly: true,
      load: loadTags(),
      select: selectTags,
      match: (t, q) => has(t?.name, q),
      toItem: t => ({
        id: t.id,
        label: t.name,
        sublabel: truncate(t.description, 60),
        link: ['/dashboard/hub/tags']
      })
    },
    {
      key: 'muscleGroups',
      label: 'Muscle Groups',
      icon: 'zap',
      adminOnly: true,
      load: loadMuscleGroups(),
      select: selectMuscleGroups,
      match: (m, q) => has(m?.name, q) || has(m?.bodyPart, q),
      toItem: m => ({
        id: m.id,
        label: m.name,
        sublabel: m.bodyPart,
        link: ['/dashboard/hub/muscle-groups']
      })
    }
  ];

  constructor(
    private store: Store,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {

    this.store
      .select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isAdmin = (user?.role || '').toLowerCase() === 'admin';
      });

    this.query$
      .pipe(
        debounceTime(300),
        map(query => query.trim().toLowerCase()),
        distinctUntilChanged(),
        // switchMap cancels the previous in-flight lookup so a fast typer never
        // sees a stale result set flash in.
        switchMap(query => {
          if (query.length < 2) {
            this.activeQuery = query;
            this.loading = false;
            return of([] as GlobalSearchGroup[]);
          }
          this.activeQuery = query;
          this.primeStores();
          return this.search(query);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(groups => {
        this.groups = groups;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── INPUT HANDLING ──────────────────────────────────────────────────────

  onQueryChange(value: string): void {
    this.query = value;
    this.expanded.clear();

    const trimmed = (value || '').trim();
    this.open = trimmed.length >= 2;
    this.loading = trimmed.length >= 2;

    if (trimmed.length < 2) {
      this.groups = [];
    }

    this.query$.next(value || '');
  }

  onFocus(): void {
    if (this.query.trim().length >= 2) {
      this.open = true;
    }
    this.activated.emit();
  }

  /** Called by the parent when it opens mobile search mode. */
  focusInput(): void {
    this.searchInput?.nativeElement.focus();
  }

  clear(): void {
    this.query = '';
    this.groups = [];
    this.loading = false;
    this.open = false;
    this.expanded.clear();
    this.query$.next('');
  }

  close(): void {
    this.open = false;
  }

  /** Closing on navigation to a result. */
  onSelect(): void {
    this.close();
    this.dismissed.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
    this.dismissed.emit();
  }

  // ── VIEW HELPERS ────────────────────────────────────────────────────────

  get totalResults(): number {
    return this.groups.reduce((sum, group) => sum + group.items.length, 0);
  }

  visibleCount(group: GlobalSearchGroup): number {
    return this.expanded.has(group.key) ? group.items.length : this.previewCount;
  }

  hasMore(group: GlobalSearchGroup): boolean {
    return !this.expanded.has(group.key) && group.items.length > this.previewCount;
  }

  expandGroup(group: GlobalSearchGroup): void {
    this.expanded.add(group.key);
  }

  trackByKey(_: number, group: GlobalSearchGroup): string {
    return group.key;
  }

  trackByItem(_: number, item: GlobalSearchItem): string {
    return `${item.id}-${item.label}`;
  }

  // ── SEARCH ──────────────────────────────────────────────────────────────

  private activeSources(): SearchSource[] {
    return this.sources.filter(source => !source.adminOnly || this.isAdmin);
  }

  /**
   * Fire each entity's existing "load" action once, and only when that entity's
   * slice is still empty — global search should never re-fetch data a page has
   * already put in the store.
   */
  private primeStores(): void {
    this.activeSources().forEach(source => {
      if (this.primed.has(source.key)) {
        return;
      }
      this.primed.add(source.key);

      this.store
        .select(source.select)
        .pipe(take(1))
        .subscribe((data: any) => {
          if (!Array.isArray(data) || data.length === 0) {
            this.store.dispatch(source.load);
          }
        });
    });
  }

  private search(query: string): Observable<GlobalSearchGroup[]> {
    const sources = this.activeSources();

    const streams: Observable<GlobalSearchGroup>[] = sources.map(source =>
      this.store.select(source.select).pipe(
        map((data: any) => ({
          key: source.key,
          label: source.label,
          icon: source.icon,
          items: (Array.isArray(data) ? data : [])
            .filter((entity: any) => {
              try {
                return source.match(entity, query);
              } catch {
                return false;
              }
            })
            .map((entity: any) => source.toItem(entity))
        }))
      )
    );

    if (streams.length === 0) {
      return of([]);
    }

    return combineLatest(streams).pipe(
      map(groups => groups.filter(group => group.items.length > 0))
    );
  }
}
