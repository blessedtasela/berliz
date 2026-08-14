import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { TrainerDetailPageComponent } from './trainer-detail-page.component';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';

describe('TrainerDetailPageComponent', () => {
  let component: TrainerDetailPageComponent;
  let fixture: ComponentFixture<TrainerDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainerDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectTrainers, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(TrainerDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
