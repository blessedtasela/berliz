import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs';

import { EquipmentPageComponent } from './equipment-page.component';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { loadAllCenterEquipment, loadAllCenterEquipmentFailure, loadAllCenterEquipmentSuccess } from 'src/app/state/center/center.actions';

describe('EquipmentPageComponent', () => {
  let component: EquipmentPageComponent;
  let fixture: ComponentFixture<EquipmentPageComponent>;
  let actions$: Subject<any>;

  beforeEach(() => {
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    actions$ = new Subject<any>();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, LoadErrorComponent],
      declarations: [EquipmentPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: Actions, useValue: actions$ },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    });
    fixture = TestBed.createComponent(EquipmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const el = () => fixture.nativeElement as HTMLElement;

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a skeleton until the first load finishes, not "coming soon"', () => {
    expect(el().querySelector('app-list-skeleton')).not.toBeNull();
    expect(el().textContent).not.toContain('Equipment listings coming soon');
  });

  it('says "coming soon" only once a load has actually come back empty', () => {
    actions$.next(loadAllCenterEquipmentSuccess({ response: [] } as any));
    fixture.detectChanges();

    expect(el().textContent).toContain('Equipment listings coming soon');
    expect(el().querySelector('app-load-error')).toBeNull();
  });

  describe('when the equipment cannot be loaded', () => {
    it('shows a retryable error instead of "coming soon"', () => {
      actions$.next(loadAllCenterEquipmentFailure({ error: 'Server exploded' }));
      fixture.detectChanges();

      expect(el().textContent).toContain("Couldn't load equipment");
      expect(el().textContent).toContain('Server exploded');
      expect(el().textContent).not.toContain('Equipment listings coming soon');
    });

    it('retrying loads it again, and a success clears the error', () => {
      actions$.next(loadAllCenterEquipmentFailure({ error: 'Server exploded' }));
      fixture.detectChanges();
      const dispatch = spyOn(TestBed.inject(MockStore), 'dispatch');

      (el().querySelector('app-load-error button') as HTMLButtonElement).click();
      expect(dispatch).toHaveBeenCalledWith(loadAllCenterEquipment());

      actions$.next(loadAllCenterEquipmentSuccess({ response: [] } as any));
      fixture.detectChanges();
      expect(el().querySelector('app-load-error')).toBeNull();
    });
  });
});
