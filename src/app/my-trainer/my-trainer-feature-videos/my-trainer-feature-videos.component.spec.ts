import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTrainerFeatureVideosComponent } from './my-trainer-feature-videos.component';

describe('MyTrainerFeatureVideosComponent', () => {
  let component: MyTrainerFeatureVideosComponent;
  let fixture: ComponentFixture<MyTrainerFeatureVideosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTrainerFeatureVideosComponent]
    });
    fixture = TestBed.createComponent(MyTrainerFeatureVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
