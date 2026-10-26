import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { nameSlug } from 'src/app/utils/closest-slug';

/**
 * /disciplines/boxing → /disciplines/2/boxing. The real discipline URL carries the id (/disciplines/:id/:name), so the
 * obvious "pretty" guess used to 404. This looks the slug up among the active disciplines and forwards there; an unknown
 * slug goes to the disciplines list instead of a dead end.
 */
@Component({
  selector: 'app-discipline-slug-redirect',
  template: `<p class="sr-only" role="status">Finding that discipline…</p>`,
  standalone: false,
})
export class DisciplineSlugRedirectComponent implements OnInit, OnDestroy {
  private sub?: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private store: Store) { }

  ngOnInit(): void {
    const slug = (this.route.snapshot.paramMap.get('slug') ?? '').toLowerCase();
    this.store.dispatch(loadActiveCategories());
    // Wait for the first non-empty list; if the list never fills (offline), the visitor still lands on the disciplines page.
    const timeout = setTimeout(() => this.router.navigate(['/disciplines'], { replaceUrl: true }), 8000);
    this.sub = this.store.select(selectActiveCategories).pipe(filter(list => (list?.length ?? 0) > 0), take(1)).subscribe(list => {
      clearTimeout(timeout);
      const match = list.find(c => nameSlug(c.name) === slug);
      if (match) this.router.navigate(['/disciplines', match.id, nameSlug(match.name)], { replaceUrl: true });
      else this.router.navigate(['/disciplines'], { replaceUrl: true });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
