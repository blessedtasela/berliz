import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { AboutUsMissionComponent } from './about-us-mission.component';

describe('AboutUsMissionComponent', () => {
  let component: AboutUsMissionComponent;
  let fixture: ComponentFixture<AboutUsMissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsMissionComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(AboutUsMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
