import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { GlobalSearchComponent, matchesCategory } from './global-search.component';

describe('GlobalSearchComponent', () => {
  let component: GlobalSearchComponent;
  let fixture: ComponentFixture<GlobalSearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [GlobalSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: ElementRef, useValue: new ElementRef(document.createElement('div')) },
      ]
    });

    fixture = TestBed.createComponent(GlobalSearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
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
