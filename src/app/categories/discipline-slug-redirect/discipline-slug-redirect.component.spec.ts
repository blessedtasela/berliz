import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { DisciplineSlugRedirectComponent } from './discipline-slug-redirect.component';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

describe('DisciplineSlugRedirectComponent', () => {
  let router: jasmine.SpyObj<Router>;
  let store: MockStore;

  function open(slug: string, categories: any[]) {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      declarations: [DisciplineSlugRedirectComponent],
      providers: [
        provideMockStore({ selectors: [{ selector: selectActiveCategories, value: categories }] }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => slug } } } },
        { provide: Router, useValue: router },
      ],
    });
    store = TestBed.inject(MockStore);
    TestBed.createComponent(DisciplineSlugRedirectComponent).detectChanges();
  }

  afterEach(() => store?.resetSelectors());

  const cats = [{ id: 2, name: 'Boxing' }, { id: 9, name: 'Muay Thai' }];

  it('sends /disciplines/boxing to the real URL with the id', () => {
    open('boxing', cats);
    expect(router.navigate).toHaveBeenCalledWith(['/disciplines', 2, 'boxing'], { replaceUrl: true });
  });

  it('handles a multi-word discipline', () => {
    open('muay-thai', cats);
    expect(router.navigate).toHaveBeenCalledWith(['/disciplines', 9, 'muay-thai'], { replaceUrl: true });
  });

  it('is case-insensitive', () => {
    open('BOXING', cats);
    expect(router.navigate).toHaveBeenCalledWith(['/disciplines', 2, 'boxing'], { replaceUrl: true });
  });

  it('lands on the disciplines list for an unknown slug rather than a dead end', () => {
    open('nonexistent', cats);
    expect(router.navigate).toHaveBeenCalledWith(['/disciplines'], { replaceUrl: true });
  });
});
