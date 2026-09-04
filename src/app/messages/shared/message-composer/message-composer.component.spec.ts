import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MessageComposerComponent } from './message-composer.component';

describe('MessageComposerComponent', () => {
  let component: MessageComposerComponent;
  let fixture: ComponentFixture<MessageComposerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [MessageComposerComponent] });
    fixture = TestBed.createComponent(MessageComposerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit emits the trimmed body and clears the draft', () => {
    const sent: string[] = [];
    component.send.subscribe(body => sent.push(body));

    component.body = '  Hello coach  ';
    component.submit();

    expect(sent).toEqual(['Hello coach']);
    expect(component.body).toBe('');
  });

  it('submit does nothing for an empty/whitespace-only draft', () => {
    const sent: string[] = [];
    component.send.subscribe(body => sent.push(body));

    component.body = '   ';
    component.submit();

    expect(sent).toEqual([]);
  });

  it('onInput emits typing(true) immediately, then typing(false) after 2s of silence', fakeAsync(() => {
    const typingEvents: boolean[] = [];
    component.typing.subscribe(t => typingEvents.push(t));

    component.onInput();
    expect(typingEvents).toEqual([true]);

    tick(2000);
    expect(typingEvents).toEqual([true, false]);
  }));

  it('onInput does not re-emit typing(true) on every keystroke while already typing', fakeAsync(() => {
    const typingEvents: boolean[] = [];
    component.typing.subscribe(t => typingEvents.push(t));

    component.onInput();
    tick(500);
    component.onInput();
    tick(500);

    expect(typingEvents).toEqual([true]);

    tick(2000);
    expect(typingEvents).toEqual([true, false]);
  }));

  it('submit immediately emits typing(false) and cancels the pending timer', fakeAsync(() => {
    const typingEvents: boolean[] = [];
    component.typing.subscribe(t => typingEvents.push(t));

    component.onInput();
    component.body = 'Hello';
    component.submit();

    expect(typingEvents).toEqual([true, false]);

    tick(2000); // the original timer, if it fired again, would show up here
    expect(typingEvents).toEqual([true, false]);
  }));
});
