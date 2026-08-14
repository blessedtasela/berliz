import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { Subject } from 'rxjs';

import { MyAvailabilityEditorComponent } from './my-availability-editor.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectAvailabilityLoading, selectMyAvailability } from 'src/app/state/availability/availability.selectors';

describe('MyAvailabilityEditorComponent', () => {
  let component: MyAvailabilityEditorComponent;
  let fixture: ComponentFixture<MyAvailabilityEditorComponent>;

  beforeEach(() => {
    const snackBarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      declarations: [MyAvailabilityEditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectAvailabilityLoading, value: false },
            { selector: selectMyAvailability, value: [] }
          ]
        }),
        { provide: Actions, useValue: new Subject() },
        { provide: SnackBarService, useValue: snackBarSpy }
      ]
    });

    fixture = TestBed.createComponent(MyAvailabilityEditorComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
