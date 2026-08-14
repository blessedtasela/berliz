import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface HubGridItem {
  key: string;
  value: string | number;
  link: string;
}

export interface HubGridGroup {
  id: 'people' | 'content' | 'personal' | 'other';
  label: string;
  caption: string;
  icon: string;
  items: HubGridItem[];
}

@Component({
  selector: 'hub-grid',
  templateUrl: './hub-grid.component.html',
  styleUrls: ['./hub-grid.component.css']
})
export class HubGridComponent implements OnChanges {
  @Input() items!: Record<string, string | number>;

  /** Partitioned view of `items`, rebuilt whenever the input map changes. */
  groups: HubGridGroup[] = [];

  /**
   * People / organizations the admin manages as entities.
   */
  private readonly PEOPLE_KEYS = ['users', 'partners', 'clients', 'members', 'trainers', 'centers'];

  /**
   * Data / content the admin curates.
   */
  private readonly CONTENT_KEYS = ['categories', 'tags', 'exercises', 'muscle-groups', 'newsletters',
    'testimonials', 'faqs', 'tasks', 'sub-tasks', 'todo-lists', 'trainer-pricing', 'center-pricing',
    'equipments', 'workouts', 'contact-us', 'problem-reports', 'payments', 'subscriptions', 'bookings'];

  /**
   * "Mine as an individual" counts. The backend appends these for EVERY role
   * (admin included) on /dashboard/details, so an admin's hub always contains
   * both `tasks` (every user's tasks, an admin-managed entity) and `my-tasks`
   * (their own task list). They are deliberately a third group so the two never
   * read as the same thing.
   */
  private readonly PERSONAL_KEYS = ['my-tasks', 'my-todos', 'my-subscriptions', 'my-workouts',
    'my-testimonials', 'liked-trainers', 'partnership', 'my-clients', 'my-members',
    'members-testimonial', 'clients-tasks', 'todos', 'my-bookings', 'my-provider-bookings'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.groups = this.buildGroups(this.items);
    }
  }

  private buildGroups(items: Record<string, string | number>): HubGridGroup[] {
    const people: HubGridItem[] = [];
    const content: HubGridItem[] = [];
    const personal: HubGridItem[] = [];
    const other: HubGridItem[] = [];

    // Sort keys by their position in the hardcoded lists so each section has a
    // stable, intentional order (the API returns an unordered map).
    const order = [...this.PEOPLE_KEYS, ...this.CONTENT_KEYS, ...this.PERSONAL_KEYS];
    const rank = (key: string) => {
      const i = order.indexOf(this.formatUrl(key));
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };

    Object.keys(items || {})
      .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
      .forEach(key => {
        const slug = this.formatUrl(key);
        const item: HubGridItem = { key, value: items[key], link: this.resolveRoute(key) };

        if (this.PEOPLE_KEYS.includes(slug)) {
          people.push(item);
        } else if (this.CONTENT_KEYS.includes(slug)) {
          content.push(item);
        } else if (this.PERSONAL_KEYS.includes(slug)) {
          personal.push(item);
        } else {
          // Defensive: never silently drop a count key the backend added after
          // these lists were written.
          other.push(item);
        }
      });

    const groups: HubGridGroup[] = [
      {
        id: 'people',
        label: 'User management',
        caption: 'People and organisations on the platform',
        icon: 'users',
        items: people
      },
      {
        id: 'content',
        label: 'Content & programs',
        caption: 'Everything you curate across all accounts',
        icon: 'layers',
        items: content
      },
      {
        id: 'personal',
        label: 'Mine only',
        caption: 'Your own items as an individual — not the platform-wide lists above',
        icon: 'user',
        items: personal
      },
      {
        id: 'other',
        label: 'Other',
        caption: 'Not yet categorised',
        icon: 'grid',
        items: other
      }
    ];

    return groups.filter(g => g.items.length > 0);
  }

  formatUrl(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  /**
   * Hub keys whose natural `/dashboard/hub/<key>` path is not where the user
   * should actually land. Everything else falls back to `/dashboard/hub/<key>`.
   */
  private readonly ROUTE_OVERRIDES: Record<string, string> = {
    // No admin CRUD table for equipment — it's center-scoped and managed from
    // "My equipment" on /dashboard/exercises, so point at the public browser.
    'equipments': '/services/equipment',
    'workouts': '/dashboard/workouts',
    'my-workouts': '/dashboard/workouts',
    'liked-trainers': '/trainers',
    // No dedicated "my testimonials" page exists (a user has at most one
    // testimonial); the merged Programs/testimonials page is the sensible landing spot.
    'my-testimonials': '/services',
  };

  resolveRoute(key: string): string {
    const slug = this.formatUrl(key);
    return this.ROUTE_OVERRIDES[slug] ?? '/dashboard/hub/' + slug;
  }

  trackByGroup(_: number, group: HubGridGroup): string {
    return group.id;
  }

  trackByItem(_: number, item: HubGridItem): string {
    return item.key;
  }
}
