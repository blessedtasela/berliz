import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';

import { MuscleGroupsComponent } from './muscle-groups.component';

describe('MuscleGroupsComponent', () => {
  let component: MuscleGroupsComponent;
  let fixture: ComponentFixture<MuscleGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideMockStore()],
    });
    fixture = TestBed.createComponent(MuscleGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
