import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubGridComponent } from './hub-grid.component';

describe('HubGridComponent', () => {
  let component: HubGridComponent;
  let fixture: ComponentFixture<HubGridComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubGridComponent]
    });
    fixture = TestBed.createComponent(HubGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
