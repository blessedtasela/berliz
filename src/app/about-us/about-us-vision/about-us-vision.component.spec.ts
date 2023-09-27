import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsVisionComponent } from './about-us-vision.component';

describe('AboutUsVisionComponent', () => {
  let component: AboutUsVisionComponent;
  let fixture: ComponentFixture<AboutUsVisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsVisionComponent]
    });
    fixture = TestBed.createComponent(AboutUsVisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
