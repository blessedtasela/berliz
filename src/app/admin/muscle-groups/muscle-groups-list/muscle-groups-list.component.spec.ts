import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupsListComponent } from './muscle-groups-list.component';

describe('MuscleGroupsListComponent', () => {
  let component: MuscleGroupsListComponent;
  let fixture: ComponentFixture<MuscleGroupsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupsListComponent]
    });
    fixture = TestBed.createComponent(MuscleGroupsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
