import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { MentionInputComponent } from './mention-input.component';
import { UserService } from 'src/app/services/user.service';

describe('MentionInputComponent', () => {
  let component: MentionInputComponent;
  let fixture: ComponentFixture<MentionInputComponent>;
  let userService: jasmine.SpyObj<UserService>;

  beforeEach(() => {
    userService = jasmine.createSpyObj('UserService', ['getPublicDirectory']);
    userService.getPublicDirectory.and.returnValue(of({ success: true, message: '', data: [], statusCode: 200 } as any));

    TestBed.configureTestingModule({
      imports: [MentionInputComponent],
      providers: [{ provide: UserService, useValue: userService }],
    });

    fixture = TestBed.createComponent(MentionInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // GN-88: a bare, unlabelled text input with an @-mention dropdown underneath it is exactly
  // the shape a browser's password manager mistakes for a username field, popping up its own
  // "fill username" prompt instead of letting the user type a comment.
  it('tells the browser this is a plain comment field, not something to autofill (GN-88)', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('text');
    expect(input.autocomplete).toBe('off');
    expect(input.name).toBe('comment');
    expect(input.getAttribute('aria-label')).toBe('Comment');
  });

  it('emits submitted on Enter when there is no suggestion menu open', () => {
    const submitted = spyOn(component.submitted, 'emit');

    component.onEnter();

    expect(submitted).toHaveBeenCalled();
  });

  it('picks the first suggestion on Enter instead of submitting when the menu is open', () => {
    component.suggestions = [{ id: 1, username: 'jane' } as any];
    const submitted = spyOn(component.submitted, 'emit');
    spyOn(component, 'select');

    component.onEnter();

    expect(component.select).toHaveBeenCalledWith(component.suggestions[0]);
    expect(submitted).not.toHaveBeenCalled();
  });
});
