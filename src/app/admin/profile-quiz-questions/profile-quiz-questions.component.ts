import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IconsModule } from 'src/app/icons/icons.module';
import { PageHeaderComponent } from 'src/app/shared/page-header/page-header.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ProfileQuizAdminService } from 'src/app/services/profile-quiz-admin.service';
import { ProfileQuizQuestion, ProfileQuizQuestionAdminRequest } from 'src/app/models/profile-quiz.model';

/** An editable row for one question -- mirrors ProfileQuizQuestion but with options kept as a
 *  plain mutable array (including brand-new ones with no id yet) for the template's ngModel bindings. */
interface EditableQuestion {
  id: number | null;
  text: string;
  displayOrder: number;
  active: boolean;
  options: { id: number | null; text: string; displayOrder: number }[];
  saving: boolean;
}

/**
 * Admin console CRUD for the GN-75 profile quiz question bank --
 * /dashboard/hub/profile-quiz-questions. The 5 seed questions (backend V116)
 * are a starting point, not a hard limit: add, edit, reorder, retire, or
 * delete a question here, each with 2+ single-choice options.
 */
@Component({
  selector: 'app-profile-quiz-questions',
  imports: [CommonModule, FormsModule, IconsModule, PageHeaderComponent],
  templateUrl: './profile-quiz-questions.component.html',
})
export class ProfileQuizQuestionsComponent implements OnInit {

  questions: EditableQuestion[] = [];
  loading = true;
  loadError: string | null = null;

  constructor(
    private adminService: ProfileQuizAdminService,
    private snackBarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.adminService.getAllQuestions().subscribe({
      next: res => {
        this.questions = (res.data ?? [])
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map(q => this.toEditable(q));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = "Couldn't load the question bank.";
      },
    });
  }

  private toEditable(q: ProfileQuizQuestion): EditableQuestion {
    return {
      id: q.id,
      text: q.text,
      displayOrder: q.displayOrder,
      active: q.active,
      options: q.options.map(o => ({ id: o.id, text: o.text, displayOrder: o.displayOrder })),
      saving: false,
    };
  }

  addQuestion(): void {
    const nextOrder = this.questions.length > 0 ? Math.max(...this.questions.map(q => q.displayOrder)) + 1 : 1;
    this.questions.push({
      id: null,
      text: '',
      displayOrder: nextOrder,
      active: true,
      options: [{ id: null, text: '', displayOrder: 1 }, { id: null, text: '', displayOrder: 2 }],
      saving: false,
    });
  }

  addOption(question: EditableQuestion): void {
    const nextOrder = question.options.length > 0 ? Math.max(...question.options.map(o => o.displayOrder)) + 1 : 1;
    question.options.push({ id: null, text: '', displayOrder: nextOrder });
  }

  removeOption(question: EditableQuestion, index: number): void {
    question.options.splice(index, 1);
  }

  save(question: EditableQuestion): void {
    if (!question.text.trim()) {
      this.snackBarService.openSnackBar('The question needs some text', 'error');
      return;
    }
    const options = question.options.filter(o => o.text.trim());
    if (options.length < 2) {
      this.snackBarService.openSnackBar('Add at least 2 options', 'error');
      return;
    }

    const request: ProfileQuizQuestionAdminRequest = {
      id: question.id ?? undefined,
      text: question.text.trim(),
      displayOrder: question.displayOrder,
      active: question.active,
      options: options.map(o => ({ id: o.id ?? undefined, text: o.text.trim(), displayOrder: o.displayOrder })),
    };

    question.saving = true;
    const request$ = question.id != null ? this.adminService.updateQuestion(request) : this.adminService.addQuestion(request);
    request$.subscribe({
      next: res => {
        question.saving = false;
        if (res.data) Object.assign(question, this.toEditable(res.data));
        this.snackBarService.openSnackBar(res.message || 'Saved', '');
      },
      error: () => {
        question.saving = false;
        this.snackBarService.openSnackBar("Couldn't save this question", 'error');
      },
    });
  }

  toggleStatus(question: EditableQuestion): void {
    if (question.id == null) return;
    question.saving = true;
    this.adminService.updateStatus(question.id).subscribe({
      next: res => {
        question.saving = false;
        if (res.data) Object.assign(question, this.toEditable(res.data));
      },
      error: () => {
        question.saving = false;
        this.snackBarService.openSnackBar("Couldn't update the question's status", 'error');
      },
    });
  }

  delete(question: EditableQuestion, index: number): void {
    if (question.id == null) {
      this.questions.splice(index, 1);
      return;
    }
    if (!confirm('Delete this question? This also deletes everyone\'s answers to it.')) return;

    question.saving = true;
    this.adminService.deleteQuestion(question.id).subscribe({
      next: () => {
        this.questions.splice(index, 1);
      },
      error: () => {
        question.saving = false;
        this.snackBarService.openSnackBar("Couldn't delete this question", 'error');
      },
    });
  }
}
