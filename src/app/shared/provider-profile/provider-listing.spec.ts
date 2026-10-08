import { TestBed } from '@angular/core/testing';

import { ProviderCardMetaComponent } from './provider-card-meta.component';
import { ProviderFilterBarComponent } from './provider-filter-bar.component';
import {
  DEFAULT_PROVIDER_CRITERIA, ProviderFilterCriteria, ProviderListing,
  activeFilterCount, applyProviderFilters, isDefaultCriteria, matchesMode, searchableLocation
} from './provider-filters';

const text = (f: { nativeElement: unknown }) => ((f.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ').trim();

describe('provider list filters', () => {
  const list: (ProviderListing & { id: number })[] = [
    { id: 1, name: 'Ava', hourlyRate: 60, reviewCount: 4, likes: 10, serviceMode: 'IN_PERSON' },
    { id: 2, name: 'Ben', hourlyRate: 30, reviewCount: 0, likes: 50, serviceMode: 'ONLINE' },
    { id: 3, name: 'Cleo', hourlyRate: null, reviewCount: 9, likes: 5, serviceMode: 'HYBRID' },
    { id: 4, name: 'Dan', hourlyRate: '90', reviewCount: 1, likes: 1, serviceMode: 'IN_PERSON' },
  ];
  const ids = (items: { id: number }[]) => items.map(i => i.id);
  const crit = (patch: Partial<ProviderFilterCriteria>): ProviderFilterCriteria => ({ ...DEFAULT_PROVIDER_CRITERIA, ...patch });

  it('the default criteria change nothing and keep the server order', () => {
    expect(ids(applyProviderFilters(list, DEFAULT_PROVIDER_CRITERIA))).toEqual([1, 2, 3, 4]);
    expect(isDefaultCriteria(DEFAULT_PROVIDER_CRITERIA)).toBeTrue();
  });

  it('a hybrid coach stays in both the in-person and online filters; the Hybrid filter shows only hybrid', () => {
    expect(matchesMode(list[2], 'IN_PERSON')).toBeTrue();
    expect(matchesMode(list[2], 'ONLINE')).toBeTrue();
    expect(ids(applyProviderFilters(list, crit({ mode: 'HYBRID' })))).toEqual([3]);
    expect(ids(applyProviderFilters(list, crit({ mode: 'ONLINE' })))).toEqual([2, 3]);
    expect(ids(applyProviderFilters(list, crit({ mode: 'IN_PERSON' })))).toEqual([1, 3, 4]);
  });

  it('a missing serviceMode is treated as in-person (the platform default)', () => {
    expect(matchesMode({ name: 'x' }, 'IN_PERSON')).toBeTrue();
    expect(matchesMode({ name: 'x' }, 'ONLINE')).toBeFalse();
  });

  it('a rate ceiling hides pricier providers and those with no rate; string rates are understood', () => {
    expect(ids(applyProviderFilters(list, crit({ maxRate: 60 })))).toEqual([1, 2]);
    expect(ids(applyProviderFilters(list, crit({ maxRate: 100 })))).toEqual([1, 2, 4]);
  });

  it('"has reviews" drops providers with none', () => {
    expect(ids(applyProviderFilters(list, crit({ withReviews: true })))).toEqual([1, 3, 4]);
  });

  it('sorts by price both ways with unpriced providers always last', () => {
    expect(ids(applyProviderFilters(list, crit({ sort: 'price-asc' })))).toEqual([2, 1, 4, 3]);
    expect(ids(applyProviderFilters(list, crit({ sort: 'price-desc' })))).toEqual([4, 1, 2, 3]);
  });

  it('sorts by reviews, likes and name', () => {
    expect(ids(applyProviderFilters(list, crit({ sort: 'reviews' })))).toEqual([3, 1, 4, 2]);
    expect(ids(applyProviderFilters(list, crit({ sort: 'likes' })))).toEqual([2, 1, 3, 4]);
    expect(ids(applyProviderFilters(list, crit({ sort: 'name' })))).toEqual([1, 2, 3, 4]);
  });

  it('ties keep the server order (the sort is stable)', () => {
    const tied = [{ id: 1, reviewCount: 2 }, { id: 2, reviewCount: 2 }, { id: 3, reviewCount: 2 }];
    expect(ids(applyProviderFilters(tied, crit({ sort: 'reviews' })))).toEqual([1, 2, 3]);
  });

  it('does not mutate the list it is given', () => {
    const copy = [...list];
    applyProviderFilters(list, crit({ sort: 'price-asc' }));
    expect(list).toEqual(copy);
  });

  it('counts only filters, not the sort, as "active filters"', () => {
    expect(activeFilterCount(crit({ sort: 'likes' }))).toBe(0);
    expect(activeFilterCount(crit({ mode: 'ONLINE', maxRate: 50, withReviews: true }))).toBe(3);
    expect(isDefaultCriteria(crit({ sort: 'likes' }))).toBeFalse();
  });

  it('location search matches the city-level address and every listed location', () => {
    const hay = searchableLocation({
      address: 'Surrey, BC, Canada',
      locations: [{ city: 'Vancouver', stateProvince: 'BC', country: 'Canada', venue: "Mike's Gym" }],
    });
    expect(hay).toContain('surrey');
    expect(hay).toContain('vancouver');
    expect(hay).toContain("mike's gym");
    expect(searchableLocation({})).toBe('');
  });
});

describe('ProviderFilterBarComponent', () => {
  function make(inputs: Partial<ProviderFilterBarComponent> = {}) {
    const f = TestBed.createComponent(ProviderFilterBarComponent);
    Object.assign(f.componentInstance, { shown: 3, total: 10, noun: 'trainers' }, inputs);
    const emitted: ProviderFilterCriteria[] = [];
    f.componentInstance.criteriaChange.subscribe(c => emitted.push(c));
    f.detectChanges();
    return { f, emitted };
  }

  it('says how many of the total are shown', () => {
    expect(text(make().f)).toContain('3 of 10 trainers');
  });

  it('emits a new criteria object when a mode chip is chosen, leaving the rest as it was', () => {
    const { f, emitted } = make({ criteria: { ...DEFAULT_PROVIDER_CRITERIA, withReviews: true } });
    const online = Array.from((f.nativeElement as HTMLElement).querySelectorAll('button')).find(b => b.textContent?.trim() === 'Online')!;
    online.click();
    expect(emitted.length).toBe(1);
    expect(emitted[0].mode).toBe('ONLINE');
    expect(emitted[0].withReviews).toBeTrue();
  });

  it('toggles "has reviews", and Reset only appears once something is active', () => {
    const { f, emitted } = make();
    expect(text(f)).not.toContain('Reset');
    const btn = Array.from((f.nativeElement as HTMLElement).querySelectorAll('button')).find(b => b.textContent?.trim() === 'Has reviews')!;
    btn.click();
    expect(emitted[0].withReviews).toBeTrue();

    f.componentInstance.criteria = emitted[0];
    f.detectChanges();
    expect(text(f)).toContain('Reset');
    expect(text(f)).toContain('1 filter on');
  });

  it('parses the rate select: a number sets the ceiling, "Any" clears it', () => {
    const { f, emitted } = make();
    f.componentInstance.setMaxRate('50');
    f.componentInstance.setMaxRate('');
    expect(emitted.map(c => c.maxRate)).toEqual([50, null]);
  });

  it('centers hide the coaching-mode chips', () => {
    const { f } = make({ showMode: false });
    expect(text(f)).not.toContain('In-person');
  });

  it('reset restores the defaults', () => {
    const { f, emitted } = make({ criteria: { mode: 'ONLINE', maxRate: 25, withReviews: true, sort: 'likes' } });
    f.componentInstance.reset();
    expect(emitted[0]).toEqual(DEFAULT_PROVIDER_CRITERIA);
  });
});

describe('ProviderCardMetaComponent', () => {
  function make(rate: number | string | null, reviews: number | null | undefined) {
    const f = TestBed.createComponent(ProviderCardMetaComponent);
    f.componentRef.setInput('rate', rate);
    f.componentRef.setInput('reviewCount', reviews);
    f.detectChanges();
    return f;
  }

  it('shows the full hourly rate and the review count', () => {
    const t = text(make(80, 12));
    expect(t).toContain('$80');
    expect(t).toContain('/ hour');
    expect(t).toContain('12 reviews');
  });

  it('says "Rate on request" rather than inventing a price', () => {
    expect(text(make(null, 0))).toContain('Rate on request');
    expect(text(make(0, 0))).toContain('Rate on request');
  });

  it('pluralises reviews and treats a missing count as zero', () => {
    expect(text(make(10, 1))).toContain('1 review');
    expect(text(make(10, 1))).not.toContain('1 reviews');
    expect(text(make(10, undefined))).toContain('0 reviews');
  });
});
