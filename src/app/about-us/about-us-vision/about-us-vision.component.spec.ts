import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AboutUsVisionComponent } from './about-us-vision.component';

describe('AboutUsVisionComponent', () => {
  let component: AboutUsVisionComponent;
  let fixture: ComponentFixture<AboutUsVisionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsVisionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(AboutUsVisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
