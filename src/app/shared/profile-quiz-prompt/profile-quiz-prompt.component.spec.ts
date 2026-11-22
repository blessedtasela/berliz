import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ProfileQuizPromptComponent } from './profile-quiz-prompt.component';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileQuizService } from 'src/app/services/profile-quiz.service';

describe('ProfileQuizPromptComponent', () => {
  let component: ProfileQuizPromptComponent;
  let fixture: ComponentFixture<ProfileQuizPromptComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let profileQuizService: jasmine.SpyObj<ProfileQuizService>;

  beforeEach(() => {
    localStorage.removeItem('profileQuizPromptDismissed');
    authService = jasmine.createSpyObj('AuthService', ['hasSession']);
    profileQuizService = jasmine.createSpyObj('ProfileQuizService', ['getStatus']);

    TestBed.configureTestingModule({
      imports: [ProfileQuizPromptComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ProfileQuizService, useValue: profileQuizService },
      ],
    });

    fixture = TestBed.createComponent(ProfileQuizPromptComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => localStorage.removeItem('profileQuizPromptDismissed'));

  it('stays hidden for a signed-out visitor without calling the API', () => {
    authService.hasSession.and.returnValue(false);

    fixture.detectChanges();

    expect(profileQuizService.getStatus).not.toHaveBeenCalled();
    expect(component.visible).toBeFalse();
  });

  it('shows the card when the quiz is not completed', () => {
    authService.hasSession.and.returnValue(true);
    profileQuizService.getStatus.and.returnValue(of({ success: true, message: '', data: { completed: false, totalQuestions: 5, answeredCount: 2 }, statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.visible).toBeTrue();
  });

  it('stays hidden once the quiz is completed', () => {
    authService.hasSession.and.returnValue(true);
    profileQuizService.getStatus.and.returnValue(of({ success: true, message: '', data: { completed: true, totalQuestions: 5, answeredCount: 5 }, statusCode: 200 } as any));

    fixture.detectChanges();

    expect(component.visible).toBeFalse();
  });

  it('stays hidden (and skips the API call) once dismissed', () => {
    localStorage.setItem('profileQuizPromptDismissed', '1');
    authService.hasSession.and.returnValue(true);

    fixture.detectChanges();

    expect(profileQuizService.getStatus).not.toHaveBeenCalled();
    expect(component.visible).toBeFalse();
  });

  it('dismiss() hides the card and persists the dismissal', () => {
    component.visible = true;

    component.dismiss();

    expect(component.visible).toBeFalse();
    expect(localStorage.getItem('profileQuizPromptDismissed')).toBe('1');
  });
});
