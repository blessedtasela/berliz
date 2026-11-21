import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of } from 'rxjs';

import { GlobalSearchComponent, matchesCategory } from './global-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    declarations: [GlobalSearchComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [],
    providers: [
        provideMockStore(),
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(GlobalSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**
   * GN-75 (Nov 21, 2026): MVP simplification hid /dashboard/payment-codes. The PY-28/29/30 search
   * source that used to find it by "bypass" or "payment code" was removed along with it -- this
   * guards against it silently reappearing (e.g. a future search source reusing that wording)
   * while the route stays dead.
   */
  it('GN-75: "bypass" and "payment code" find nothing -- the page they used to find is hidden', async () => {
    (component as any).isAdmin = true;
    spyOn(TestBed.inject(Store), 'select').and.returnValue(of([]));
    (component as any).primeStores();

    const bypassGroups: any[] = await firstValueFrom((component as any).search('bypass'));
    const paymentCodeGroups: any[] = await firstValueFrom((component as any).search('payment code'));

    expect(bypassGroups.every((g: any) => g.items.length === 0)).toBeTrue();
    expect(paymentCodeGroups.every((g: any) => g.items.length === 0)).toBeTrue();
  });
});

/**
 * matchesCategory drives two things a user explicitly asked for: typing an
 * entity's own name (or a typo/partial of it) should surface a "See all X"
 * link to that entity's listing page, and should surface featured
 * trainers/centers even when their own name doesn't match the query.
 */
describe('matchesCategory', () => {
  it('matches the exact category label', () => {
    expect(matchesCategory('Trainers', 'trainer')).toBe(true);
    expect(matchesCategory('Trainers', 'trainers')).toBe(true);
  });

  it('matches a partial/typo of the category label', () => {
    expect(matchesCategory('Trainers', 'rainer')).toBe(true);
  });

  it('matches a longer query that contains the whole category label', () => {
    expect(matchesCategory('Centers', 'centers near me')).toBe(true);
  });

  it('does not match an unrelated query', () => {
    expect(matchesCategory('Trainers', 'workout')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(matchesCategory('Workouts', 'WORK')).toBe(true);
  });
});
