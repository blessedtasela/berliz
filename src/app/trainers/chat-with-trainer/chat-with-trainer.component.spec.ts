import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWithTrainerComponent } from './chat-with-trainer.component';

describe('ChatWithTrainerComponent', () => {
  let component: ChatWithTrainerComponent;
  let fixture: ComponentFixture<ChatWithTrainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChatWithTrainerComponent]
    });
    fixture = TestBed.createComponent(ChatWithTrainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
