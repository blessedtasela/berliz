import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { ServicesPageComponent } from './services-page.component';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { loadActiveCategoriesSuccess } from 'src/app/state/category/category.actions';

describe('ServicesPageComponent', () => {
  it('lists what Berliz offers and the disciplines underneath', () => {
    TestBed.configureTestingModule({
      imports: [ServicesPageComponent],
      providers: [
        provideRouter([]),
        provideMockStore({ selectors: [{ selector: selectActiveCategories, value: [{ id: 5, name: 'Boxing', photoUrl: '', likes: 3 }] as any }] }),
      ],
    });
    const fixture = TestBed.createComponent(ServicesPageComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Online personal training');
    expect(text).toContain('Hybrid training');
    expect(text).toContain('In-person personal training');
    expect(text).toContain('Gyms & training centers');
    expect(text).toContain('Shop');
    expect(text).toContain('Boxing');
  });

  // GN-52: /services is build-time prerendered, same as /disciplines -- which already had
  // this gate. Before this, the static snapshot always caught the still-empty initial store
  // value and baked in "No disciplines yet." regardless of the real data.
  describe('before the first load resolves (and permanently, on the server)', () => {
    let stream: Subject<any>;

    beforeEach(() => {
      stream = new Subject();
      TestBed.configureTestingModule({
        imports: [ServicesPageComponent],
        providers: [
          provideRouter([]),
          provideMockStore({ selectors: [{ selector: selectActiveCategories, value: [] as any }] }),
          { provide: Actions, useValue: new Actions(stream) },
        ],
      });
    });

    it('shows the skeleton, not "No disciplines yet"', () => {
      const fixture = TestBed.createComponent(ServicesPageComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-list-skeleton')).toBeTruthy();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('No disciplines yet');
    });

    it('swaps to "No disciplines yet" only once the first load actually finishes empty', () => {
      const fixture = TestBed.createComponent(ServicesPageComponent);
      fixture.detectChanges();

      stream.next(loadActiveCategoriesSuccess({ response: { data: [] } as any }));
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-list-skeleton')).toBeFalsy();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('No disciplines yet');
    });
  });
});
