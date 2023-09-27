import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunNowPageComponent } from './run-now-page.component';

describe('RunNowPageComponent', () => {
  let component: RunNowPageComponent;
  let fixture: ComponentFixture<RunNowPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunNowPageComponent]
    });
    fixture = TestBed.createComponent(RunNowPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
