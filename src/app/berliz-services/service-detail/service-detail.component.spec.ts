import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';

import { ServiceDetailComponent } from './service-detail.component';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';

describe('ServiceDetailComponent', () => {
  let fixture: ComponentFixture<ServiceDetailComponent>;
  let params: BehaviorSubject<any>;
  let store: MockStore;

  // provideMockStore({ selectors }) patches the shared selector instance; without this the overridden
  // selectActiveTrainers result leaks into every later spec in the run.
  afterEach(() => store?.resetSelectors());

  function setup(slug: string) {
    params = new BehaviorSubject(convertToParamMap({ slug }));
    TestBed.configureTestingModule({
      imports: [ServiceDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore({
          selectors: [
            { selector: selectActiveTrainers, value: [
              { id: 1, name: 'Ada Online', motto: 'Anywhere', hourlyRate: 30, serviceMode: 'ONLINE' },
              { id: 2, name: 'Ben Gym', motto: 'In the gym', hourlyRate: 50, serviceMode: 'IN_PERSON' },
            ] as any },
          ],
        }),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ServiceDetailComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows a training mode and only the trainers who offer it', () => {
    const el = setup('online-training');
    expect(el.textContent).toContain('Online personal training');
    expect(el.textContent).toContain('How it works');
    expect(el.textContent).toContain('Ada Online');
    expect(el.textContent).not.toContain('Ben Gym');
    expect(el.textContent).toContain('Find online trainers');
  });

  // 'gyms-and-centers' was restored alongside /centers (Nov 27, 2026); 'shop' stays hidden --
  // /shop was never restored, so that slug still correctly falls into "not found" below.

  it('says so for an unknown service', () => {
    const el = setup('nope');
    expect(el.textContent).toContain('Service not found');
  });
});
