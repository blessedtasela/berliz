import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResfreshTokenModalComponent } from './resfresh-token-modal.component';

describe('ResfreshTokenModalComponent', () => {
  let component: ResfreshTokenModalComponent;
  let fixture: ComponentFixture<ResfreshTokenModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ResfreshTokenModalComponent]
    });
    fixture = TestBed.createComponent(ResfreshTokenModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
