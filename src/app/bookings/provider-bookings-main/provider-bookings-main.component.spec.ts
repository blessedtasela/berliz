import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ProviderBookingsMainComponent } from './provider-bookings-main.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('ProviderBookingsMainComponent', () => {
  let component: ProviderBookingsMainComponent;
  let fixture: ComponentFixture<ProviderBookingsMainComponent>;

  beforeEach(() => {
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
    declarations: [ProviderBookingsMainComponent],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule, MatDialogModule],
    providers: [
        provideMockStore(),
        { provide: Actions, useValue: of() },
        { provide: SnackBarService, useValue: mockSnackBarService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});

    fixture = TestBed.createComponent(ProviderBookingsMainComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
