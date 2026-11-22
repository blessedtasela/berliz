import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { PageHeaderComponent } from 'src/app/shared/page-header/page-header.component';
import { ProfileQuizService } from 'src/app/services/profile-quiz.service';
import { ProfileQuizAnswerInput, ProfileQuizQuestion } from 'src/app/models/profile-quiz.model';

/**
 * GN-75 Phase 2's 5-question "tell us about your goals" quiz -- one question
 * per step, answered all at once at the end (unlike the client-onboarding
 * wizard, which autosaves per step: this is a handful of single-choice taps,
 * not a form with text fields worth protecting from a lost tab). Reachable
 * any time at /dashboard/hub/profile-quiz; also linked from
 * ProfileQuizPromptComponent's dismissible feed card for anyone who hasn't
 * finished it yet. "Skip for now" always works -- this is a preference
 * survey that improves recommendations, never a gate on using the app.
 */
@Component({
  selector: 'app-profile-quiz-wizard',
  imports: [CommonModule, RouterModule, IconsModule, PageHeaderComponent],
  templateUrl: './profile-quiz-wizard.component.html',
})
export class ProfileQuizWizardComponent implements OnInit {

  questions: ProfileQuizQuestion[] = [];
  answersByQuestionId: Record<number, number> = {};
  step = 0;

  loading = true;
  loadError: string | null = null;
  submitting = false;
  submitError: string | null = null;
  finished = false;

  constructor(
    private service: ProfileQuizService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.loadError = null;
    this.service.getQuestions().subscribe({
      next: res => {
        this.questions = res.data ?? [];
        this.answersByQuestionId = {};
        for (const q of this.questions) {
          if (q.answeredOptionId != null) this.answersByQuestionId[q.id] = q.answeredOptionId;
        }
        // Resume on the first unanswered question rather than always starting over.
        const firstUnanswered = this.questions.findIndex(q => this.answersByQuestionId[q.id] == null);
        this.step = firstUnanswered === -1 ? 0 : firstUnanswered;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = "Couldn't load the quiz questions.";
      },
    });
  }

  get currentQuestion(): ProfileQuizQuestion | null {
    return this.questions[this.step] ?? null;
  }

  get isLastStep(): boolean {
    return this.step >= this.questions.length - 1;
  }

  get canGoNext(): boolean {
    const q = this.currentQuestion;
    return !!q && this.answersByQuestionId[q.id] != null;
  }

  choose(optionId: number): void {
    const q = this.currentQuestion;
    if (!q) return;
    this.answersByQuestionId[q.id] = optionId;
  }

  back(): void {
    if (this.step > 0) this.step--;
  }

  next(): void {
    if (!this.canGoNext) return;
    if (this.isLastStep) {
      this.finish();
    } else {
      this.step++;
    }
  }

  finish(): void {
    const answers: ProfileQuizAnswerInput[] = this.questions
      .filter(q => this.answersByQuestionId[q.id] != null)
      .map(q => ({ questionId: q.id, optionId: this.answersByQuestionId[q.id] }));

    if (answers.length === 0) {
      this.leave();
      return;
    }

    this.submitting = true;
    this.submitError = null;
    this.service.submitAnswers(answers).subscribe({
      next: () => {
        this.submitting = false;
        this.finished = true;
      },
      error: () => {
        this.submitting = false;
        this.submitError = "Couldn't save your answers. Please try again.";
      },
    });
  }

  skip(): void {
    this.leave();
  }

  continue(): void {
    this.leave();
  }

  private leave(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
  }
}
