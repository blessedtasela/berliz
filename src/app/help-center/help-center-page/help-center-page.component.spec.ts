import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCenterPageComponent } from './help-center-page.component';

describe('HelpCenterPageComponent', () => {
  let component: HelpCenterPageComponent;
  let fixture: ComponentFixture<HelpCenterPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HelpCenterPageComponent]
    });
    fixture = TestBed.createComponent(HelpCenterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
