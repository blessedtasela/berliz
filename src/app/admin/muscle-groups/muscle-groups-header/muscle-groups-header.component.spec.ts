import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupsHeaderComponent } from './muscle-groups-header.component';

describe('MuscleGroupsHeaderComponent', () => {
  let component: MuscleGroupsHeaderComponent;
  let fixture: ComponentFixture<MuscleGroupsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupsHeaderComponent]
    });
    fixture = TestBed.createComponent(MuscleGroupsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
