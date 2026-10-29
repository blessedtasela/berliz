import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { BehaviorSubject } from 'rxjs';

import { ServiceDetailComponent } from './service-detail.component';
import { selectActiveTrainers } from 'src/app/state/trainer/trainer.selector';
import { selectActiveCenters } from 'src/app/state/center/center.selectors';

describe('ServiceDetailComponent', () => {
  let fixture: ComponentFixture<ServiceDetailComponent>;
  let params: BehaviorSubject<any>;
  let store: MockStore;

  // provideMockStore({ selectors }) patches the shared selector instances; without this the overridden
  // selectActiveCenters/selectActiveTrainers results leak into every later spec in the run.
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
            { selector: selectActiveCenters, value: [{ id: 9, name: 'Iron Works', motto: 'Lift' }] as any },
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

  it('lists centers for gyms & centers', () => {
    const el = setup('gyms-and-centers');
    expect(el.textContent).toContain('Iron Works');
  });

  it('sends the shop page to the real shop', () => {
    const el = setup('shop');
    expect(el.textContent).toContain('Open the shop');
    expect(el.textContent).toContain('community marketplace');
  });

  it('says so for an unknown service', () => {
    const el = setup('nope');
    expect(el.textContent).toContain('Service not found');
  });
});
