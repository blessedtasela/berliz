import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { TrainerListComponent } from './trainer-list.component';

describe('TrainerListComponent', () => {
  let component: TrainerListComponent;
  let fixture: ComponentFixture<TrainerListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerListComponent],
      imports: [RouterTestingModule, StrapiUrlPipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: TrainerService, useValue: jasmine.createSpyObj('TrainerService', ['updateTrainerStatus', 'deleteTrainer', 'updateTrainerPhoto']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: RxStompService, useValue: jasmine.createSpyObj('RxStompService', { watch: of({ body: '{}' }) }) },
      ]
    });
    fixture = TestBed.createComponent(TrainerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('still lists a trainer that has no photo (the API sends photoResponse: null)', () => {
    component.trainersData = [{ id: 1, name: 'Tee Coach', likes: 3, partnerId: 2, status: 'true', date: new Date(), photoResponse: null } as any];
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Tee Coach');
  });

  it('shows nothing, instead of throwing, for a missing or unreadable date (one bad row must not blank the list)', () => {
    expect(component.formatDate(undefined)).toBe('');
    expect(component.formatDate(null)).toBe('');
    expect(component.formatDate('not a date')).toBe('');
    expect(component.formatDate('2026-10-11T12:00:00')).toBe('11/10/2026');
  });
});
