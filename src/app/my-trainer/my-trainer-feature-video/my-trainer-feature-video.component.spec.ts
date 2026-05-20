import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerFeatureVideoComponent } from './my-trainer-feature-video.component';

describe('MyTrainerFeatureVideoComponent', () => {
  let component: MyTrainerFeatureVideoComponent;
  let fixture: ComponentFixture<MyTrainerFeatureVideoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerFeatureVideoComponent]
    });
    fixture = TestBed.createComponent(MyTrainerFeatureVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
