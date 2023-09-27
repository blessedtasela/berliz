import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutUsMissionComponent } from './about-us-mission.component';

describe('AboutUsMissionComponent', () => {
  let component: AboutUsMissionComponent;
  let fixture: ComponentFixture<AboutUsMissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AboutUsMissionComponent]
    });
    fixture = TestBed.createComponent(AboutUsMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
