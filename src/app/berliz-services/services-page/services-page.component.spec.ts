import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';

import { ServicesPageComponent } from './services-page.component';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';

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
});
