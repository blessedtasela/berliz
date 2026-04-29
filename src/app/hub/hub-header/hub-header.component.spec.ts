import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubHeaderComponent } from './hub-header.component';

describe('HubHeaderComponent', () => {
  let component: HubHeaderComponent;
  let fixture: ComponentFixture<HubHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubHeaderComponent]
    });
    fixture = TestBed.createComponent(HubHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
