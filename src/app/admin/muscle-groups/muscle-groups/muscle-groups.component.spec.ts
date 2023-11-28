import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MuscleGroupsComponent } from './muscle-groups.component';

describe('MuscleGroupsComponent', () => {
  let component: MuscleGroupsComponent;
  let fixture: ComponentFixture<MuscleGroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupsComponent]
    });
    fixture = TestBed.createComponent(MuscleGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
