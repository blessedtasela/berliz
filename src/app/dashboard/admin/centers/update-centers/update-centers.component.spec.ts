import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateCentersComponent } from './update-centers.component';

describe('UpdateCentersComponent', () => {
  let component: UpdateCentersComponent;
  let fixture: ComponentFixture<UpdateCentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateCentersComponent]
    });
    fixture = TestBed.createComponent(UpdateCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
