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
   * Restored (Nov 27, 2026) alongside the /dashboard/payment-codes route (GN-117): "bypass" is
   * the exact word the admin notification uses ("Open bypass codes to send them one, or decline"),
   * so search must find the page by that word, not just by its own name.
   */
  it('finds the Payment codes page by "bypass", the word its own admin notification uses', async () => {
    (component as any).isAdmin = true;
    spyOn(TestBed.inject(Store), 'select').and.returnValue(of([]));
    (component as any).primeStores();

    const bypassGroups: any[] = await firstValueFrom((component as any).search('bypass'));
    const paymentCodeGroups: any[] = await firstValueFrom((component as any).search('payment code'));

    expect(bypassGroups.some((g: any) => g.items.length > 0)).toBeTrue();
    expect(paymentCodeGroups.some((g: any) => g.items.length > 0)).toBeTrue();
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
