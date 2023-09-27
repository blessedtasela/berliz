import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterTrainersComponent } from './center-trainers.component';

describe('CenterTrainersComponent', () => {
  let component: CenterTrainersComponent;
  let fixture: ComponentFixture<CenterTrainersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterTrainersComponent]
    });
    fixture = TestBed.createComponent(CenterTrainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
