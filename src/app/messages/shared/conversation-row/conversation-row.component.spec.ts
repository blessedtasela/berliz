import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ConversationRowComponent } from './conversation-row.component';

describe('ConversationRowComponent', () => {
  let component: ConversationRowComponent;
  let fixture: ComponentFixture<ConversationRowComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConversationRowComponent, RouterTestingModule],
    });
    fixture = TestBed.createComponent(ConversationRowComponent);
    component = fixture.componentInstance;
    component.row = { userId: 5, name: 'Coach Sam', preview: 'Hey!', unreadCount: 2 };
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('emits the row userId on open', () => {
    const openedIds: number[] = [];
    component.open.subscribe(id => openedIds.push(id));

    component.open.emit(component.row.userId);

    expect(openedIds).toEqual([5]);
  });
});
