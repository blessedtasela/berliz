import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithTrainerPopUpComponent } from './chat-with-trainer-pop-up.component';

describe('ChatWithTrainerPopUpComponent', () => {
  let component: ChatWithTrainerPopUpComponent;
  let fixture: ComponentFixture<ChatWithTrainerPopUpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithTrainerPopUpComponent]
    });
    fixture = TestBed.createComponent(ChatWithTrainerPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
