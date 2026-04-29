import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubMainComponent } from './hub-main.component';

describe('HubMainComponent', () => {
  let component: HubMainComponent;
  let fixture: ComponentFixture<HubMainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubMainComponent]
    });
    fixture = TestBed.createComponent(HubMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
