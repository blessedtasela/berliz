import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithCenterComponent } from './chat-with-center.component';

describe('ChatWithCenterComponent', () => {
  let component: ChatWithCenterComponent;
  let fixture: ComponentFixture<ChatWithCenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithCenterComponent]
    });
    fixture = TestBed.createComponent(ChatWithCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
