import { Observable, catchError, map, of } from 'rxjs';

import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';

export type ProviderKind = 'trainer' | 'center';

export interface ResolvedProvider {
  id: number;
  name: string;
  photoUrl: string | null;
  /** Public contact details the provider chose to publish (centers only so far). */
  contactEmail?: string | null;
  contactPhone?: string | null;
}

/** "Jo Smith" <-> "Jo-Smith": the provider's name is its URL segment. */
export function providerSlug(name: string): string {
  return name.replace(/ /g, '-');
}

/**
 * Finds the active trainer/center a `/trainers/:name/...` or `/centers/:name/...` page is about, from the name in
 * the URL. Emits null when there is no such provider (or the lookup failed), so the page can say so.
 */
export function resolveProviderBySlug(
  kind: ProviderKind,
  slug: string | null,
  trainerService: TrainerService,
  centerService: CenterService,
): Observable<ResolvedProvider | null> {
  if (!slug) return of(null);

  const list$: Observable<{ data?: any[] } | null> = kind === 'trainer' ? trainerService.getActiveTrainers() : centerService.getActiveCenters();
  return list$.pipe(
    catchError(() => of(null)),
    map(response => {
      const providers: any[] = response?.data ?? [];
      const match = providers.find(p => p.name && providerSlug(p.name).toLowerCase() === slug.toLowerCase());
      return match
        ? {
          id: match.id,
          name: match.name,
          photoUrl: match.photoResponse?.photoUrl || null,
          contactEmail: match.contactEmail || null,
          contactPhone: match.contactPhone || null,
        }
        : null;
    }),
  );
}
