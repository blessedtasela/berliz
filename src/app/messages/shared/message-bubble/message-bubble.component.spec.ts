import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBubbleComponent } from './message-bubble.component';
import { Message } from 'src/app/models/message.model';

describe('MessageBubbleComponent', () => {
  let component: MessageBubbleComponent;
  let fixture: ComponentFixture<MessageBubbleComponent>;

  const baseMessage: Message = {
    id: 1, senderId: 5, senderName: 'Coach Sam', recipientId: 1, recipientName: 'Jane Doe',
    body: 'Hey!', isRead: false, date: new Date(), lastUpdate: new Date(), deleted: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MessageBubbleComponent] });
    fixture = TestBed.createComponent(MessageBubbleComponent);
    component = fixture.componentInstance;
    component.message = { ...baseMessage };
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('canUnsend is true only for a mine, not-yet-deleted message', () => {
    component.mine = true;
    expect(component.canUnsend).toBeTrue();

    component.message = { ...baseMessage, deleted: true };
    expect(component.canUnsend).toBeFalse();

    component.mine = false;
    component.message = { ...baseMessage };
    expect(component.canUnsend).toBeFalse();
  });

  it('emits the message id on unsend', () => {
    const unsentIds: number[] = [];
    component.unsend.subscribe(id => unsentIds.push(id));

    component.unsend.emit(component.message.id);

    expect(unsentIds).toEqual([1]);
  });
});
