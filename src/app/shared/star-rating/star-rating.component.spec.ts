import { ComponentFixture, TestBed } from '@angular/core/testing';

import { applyProviderFilters, DEFAULT_PROVIDER_CRITERIA } from '../provider-profile/provider-filters';
import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let fixture: ComponentFixture<StarRatingComponent>;
  let cmp: StarRatingComponent;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StarRatingComponent] });
    fixture = TestBed.createComponent(StarRatingComponent);
    cmp = fixture.componentInstance;
  });

  it('shows the average and count with an accessible label', () => {
    cmp.value = 4.6;
    cmp.count = 12;
    fixture.detectChanges();
    expect(el().textContent).toContain('4.6');
    expect(el().textContent).toContain('(12)');
    expect(el().querySelector('[role="img"]')?.getAttribute('aria-label')).toBe('Rated 4.6 out of 5 from 12 reviews');
  });

  it('shows nothing, or "No ratings yet", when unrated; never five empty stars', () => {
    fixture.detectChanges();
    expect(el().querySelector('svg')).toBeNull();
    cmp.showUnrated = true;
    fixture.detectChanges();
    expect(el().textContent).toContain('No ratings yet');
  });

  it('clamps a bad value so the star row cannot overflow', () => {
    cmp.value = 9;
    expect(cmp.fillPercent).toBe(100);
    cmp.value = -3;
    expect(cmp.fillPercent).toBe(0);
  });

  it('interactive: picking a star emits and reports to a form control', () => {
    cmp.interactive = true;
    const changes: number[] = [];
    cmp.registerOnChange(v => changes.push(v));
    cmp.valueChange.subscribe((v: number) => changes.push(v * 10));
    fixture.detectChanges();

    (el().querySelectorAll('button')[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(cmp.value).toBe(4);
    expect(changes).toEqual([40, 4]);
    expect(el().querySelectorAll('button')[3].getAttribute('aria-checked')).toBe('true');
    expect(el().querySelectorAll('button').length).toBe(5);
  });

  it('interactive: arrow keys move the rating within 1 to 5', () => {
    cmp.interactive = true;
    cmp.writeValue(5);
    fixture.detectChanges();
    const group = el().querySelector('[role="radiogroup"]') as HTMLElement;
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(cmp.value).toBe(5);
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(cmp.value).toBe(4);
  });

  it('a disabled control ignores clicks', () => {
    cmp.interactive = true;
    cmp.setDisabledState(true);
    cmp.pick(3);
    expect(cmp.value).toBeNull();
  });
});

describe('sorting by highest rated', () => {
  it('puts the best average first, breaks ties by review count, and leaves unrated last', () => {
    const list = [
      { id: 1, averageRating: null, reviewCount: 0 },
      { id: 2, averageRating: 4.5, reviewCount: 2 },
      { id: 3, averageRating: 4.5, reviewCount: 30 },
      { id: 4, averageRating: 5, reviewCount: 1 },
    ];
    const out = applyProviderFilters(list, { ...DEFAULT_PROVIDER_CRITERIA, sort: 'rating' });
    expect(out.map(p => p.id)).toEqual([4, 3, 2, 1]);
  });
});
