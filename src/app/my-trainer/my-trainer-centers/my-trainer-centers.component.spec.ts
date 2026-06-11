import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerCentersComponent } from './my-trainer-centers.component';

describe('MyTrainerCentersComponent', () => {
  let component: MyTrainerCentersComponent;
  let fixture: ComponentFixture<MyTrainerCentersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerCentersComponent]
    });
    fixture = TestBed.createComponent(MyTrainerCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
