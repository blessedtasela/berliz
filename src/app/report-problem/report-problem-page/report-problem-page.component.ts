import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { ProblemReportService } from 'src/app/services/problem-report.service';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { fullNameValidator, genericError } from 'src/validators/form-validators.module';

export interface ProblemCategoryOption {
  value: string;
  label: string;
  description: string;
  icon: string;
}

@Component({
    selector: 'app-report-problem-page',
    templateUrl: './report-problem-page.component.html',
    styleUrls: ['./report-problem-page.component.css'],
    standalone: false
})
export class ReportProblemPageComponent implements OnInit, OnDestroy {

  reportForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  submitted = false;
  submitError = '';
  successMessage = '';
  referenceCode: string | null = null;
  subscriptions: Subscription[] = [];

  /**
   * GN-32's taxonomy. Picking one is a human override of the backend's own
   * classifier (which always runs from the description) -- never required,
   * so category is left unselected by default and the control carries no
   * Validators.required. An earlier version of this form sent the RETIRED
   * bug/billing/safety-concern/other values here, which the backend's
   * VALID_CATEGORIES check rejects outright (400) for every one of them
   * except "other" -- silently breaking most submissions.
   */
  readonly categories: ProblemCategoryOption[] = [
    { value: 'PAYMENTS', label: 'Payments & billing', description: 'A charge, refund, payout or subscription issue.', icon: 'credit-card' },
    { value: 'BOOKINGS', label: 'Bookings & sessions', description: 'Something about scheduling, cancelling or a session itself.', icon: 'calendar' },
    { value: 'ACCOUNT_AND_ACCESS', label: 'Account & access', description: 'Signing in, your profile, or getting locked out.', icon: 'lock' },
    { value: 'SAFETY', label: 'Safety concern', description: 'A trainer, center or member behaved inappropriately.', icon: 'shield' },
    { value: 'TECHNICAL', label: 'Something is broken', description: 'A page, button or feature isn’t working as expected.', icon: 'alert-triangle' },
    { value: 'CONTENT_AND_PROFILE', label: 'Content or a profile', description: 'Something wrong with a listing, photo or profile content.', icon: 'image' },
    { value: 'OTHER', label: 'Something else', description: 'Anything that doesn’t fit the categories above.', icon: 'info' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private problemReportService: ProblemReportService,
    private authService: AuthService,
    private store: Store,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.reportForm = this.formBuilder.group({
      category: [''],
      name: ['', [Validators.required, fullNameValidator()]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });

    // Auto-attach the reporter's identity when they're logged in — same
    // getCurrentUserEmail()/getToken() check other pages use (see AuthService).
    // Anonymous visitors get a blank, editable form instead (this page has no
    // AuthGuard — see app-routing.module.ts).
    if (this.authService.isAuthenticated()) {
      this.store.dispatch(loadUser());
      this.subscriptions.push(
        this.store.select(selectUser).subscribe((user: any) => {
          if (user && !this.reportForm.get('name')?.dirty && !this.reportForm.get('email')?.dirty) {
            const fullName = [user.firstname, user.lastname].filter(Boolean).join(' ');
            this.reportForm.patchValue({
              name: fullName || this.reportForm.value.name,
              email: user.email || this.reportForm.value.email
            });
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  selectCategory(value: string): void {
    this.reportForm.get('category')?.setValue(value);
    this.reportForm.get('category')?.markAsTouched();
  }

  submitForm(): void {
    this.submitError = '';
    this.successMessage = '';

    if (this.reportForm.invalid) {
      this.invalidForm = true;
      this.reportForm.markAllAsTouched();
      this.submitError = 'Please complete all required fields.';
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.problemReportService.addProblemReport(this.reportForm.value).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.submitted = true;
        this.invalidForm = false;
        this.successMessage = response?.message || 'Your report has been submitted. Our team will look into it.';
        this.referenceCode = response?.referenceCode || null;
        this.reportForm.reset();
      },
      error: (error: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.submitError = error?.error?.message || genericError;
      }
    });
  }

  dismissSuccess(): void {
    this.submitted = false;
    this.successMessage = '';
    this.referenceCode = null;
  }

  trackByCategory(_: number, category: ProblemCategoryOption): string {
    return category.value;
  }
}
