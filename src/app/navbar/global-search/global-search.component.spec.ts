import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { firstValueFrom, of } from 'rxjs';

import { GlobalSearchComponent, matchesCategory } from './global-search.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;
  let httpMock: HttpTestingController;

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
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  /**
   * PY-28/29/30: the admin notification literally says "Open bypass codes", but global search had
   * no source at all for either bypass-code system -- typing the exact word it uses found nothing.
   */
  it('PY-28/29/30: finds the Payment codes page by typing "bypass", with its issued codes searchable', async () => {
    (component as any).isAdmin = true;
    // Every other source in this list reads an NgRx slice this bare mock store doesn't have --
    // irrelevant to what this test checks, so every store-backed source resolves to no results.
    spyOn(TestBed.inject(Store), 'select').and.returnValue(of([]));
    (component as any).primeStores();
    httpMock.expectOne(req => req.url.includes('/bypassCode/get')).flush({ data: [], success: true, message: '', statusCode: 200 });

    const groups: any[] = await firstValueFrom((component as any).search('bypass'));

    const bypassGroup = groups.find((g: any) => g.key === 'bypassCodes');
    expect(bypassGroup).toBeTruthy();
    expect(bypassGroup.items.some((i: any) => i.label === 'See all Bypass codes')).toBeTrue();
    expect(bypassGroup.items[0].link).toEqual(['/dashboard/payment-codes']);
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
