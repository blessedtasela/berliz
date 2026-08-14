import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { MuscleGroupDetailPageComponent } from './muscle-group-detail-page.component';
import { selectMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';

describe('MuscleGroupDetailPageComponent', () => {
  let component: MuscleGroupDetailPageComponent;
  let fixture: ComponentFixture<MuscleGroupDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectMuscleGroups, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(MuscleGroupDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
