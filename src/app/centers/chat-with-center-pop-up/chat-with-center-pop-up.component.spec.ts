import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithCenterPopUpComponent } from './chat-with-center-pop-up.component';

describe('ChatWithCenterPopUpComponent', () => {
  let component: ChatWithCenterPopUpComponent;
  let fixture: ComponentFixture<ChatWithCenterPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithCenterPopUpComponent]
    });
    fixture = TestBed.createComponent(ChatWithCenterPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
