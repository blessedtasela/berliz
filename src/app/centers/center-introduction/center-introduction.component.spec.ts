import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CenterIntroductionComponent } from './center-introduction.component';

describe('CenterIntroductionComponent', () => {
  let component: CenterIntroductionComponent;
  let fixture: ComponentFixture<CenterIntroductionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CenterIntroductionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(CenterIntroductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
