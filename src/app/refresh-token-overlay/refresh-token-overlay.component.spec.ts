import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshTokenOverlayComponent } from './refresh-token-overlay.component';

describe('RefreshTokenOverlayComponent', () => {
  let component: RefreshTokenOverlayComponent;
  let fixture: ComponentFixture<RefreshTokenOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RefreshTokenOverlayComponent]
    });
    fixture = TestBed.createComponent(RefreshTokenOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
