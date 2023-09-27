import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithSellerComponent } from './chat-with-seller.component';

describe('ChatWithSellerComponent', () => {
  let component: ChatWithSellerComponent;
  let fixture: ComponentFixture<ChatWithSellerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithSellerComponent]
    });
    fixture = TestBed.createComponent(ChatWithSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
