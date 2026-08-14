import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AboutUsIntroductionComponent } from './about-us-introduction.component';

describe('AboutUsIntroductionComponent', () => {
  let component: AboutUsIntroductionComponent;
  let fixture: ComponentFixture<AboutUsIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsIntroductionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(AboutUsIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
