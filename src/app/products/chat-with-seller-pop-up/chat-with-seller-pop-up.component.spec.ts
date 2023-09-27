import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithSellerPopUpComponent } from './chat-with-seller-pop-up.component';

describe('ChatWithSellerPopUpComponent', () => {
  let component: ChatWithSellerPopUpComponent;
  let fixture: ComponentFixture<ChatWithSellerPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithSellerPopUpComponent]
    });
    fixture = TestBed.createComponent(ChatWithSellerPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
