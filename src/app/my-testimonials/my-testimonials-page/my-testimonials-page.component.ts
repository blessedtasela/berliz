import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { TestimonialDialogService } from 'src/app/testimonial/testimonial-dialog.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Testimonials } from 'src/app/models/testimonials.model';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Dashboard-native "My Testimonials" list — what the hub tile now links to
 * instead of dumping the user on the public /services page. A user can hold
 * up to three testimonials (one general "about Berliz", one per center, one
 * per trainer — enforced server-side), so this is a list, not a singleton.
 * Writing a new one reuses the same target-picker dialog the public site
 * uses; editing is inline here and only server-permitted while still
 * pending (status "false") — once approved it's locked.
 */
@Component({
    selector: 'app-my-testimonials-page',
    imports: [CommonModule, RouterModule, FormsModule, IconsModule, SharedModule, LoadErrorComponent],
    templateUrl: './my-testimonials-page.component.html',
    styleUrls: ['./my-testimonials-page.component.css']
})
export class MyTestimonialsPageComponent implements OnInit {

  testimonials: Testimonials[] = [];
  loading = true;
  /** Set when the testimonials list failed to load; shown inline with a Retry. */
  loadError: string | null = null;
  /** Why saving the inline edit failed; shown inside the edit box. */
  editError: string | null = null;

  /** id of the testimonial currently open for inline editing, if any. */
  editingId: number | null = null;
  editText = '';
  saving = false;

  constructor(
    private testimonialService: TestimonialService,
    private testimonialDialogService: TestimonialDialogService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.testimonialService.getMyTestimonials()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.testimonials = res?.data ?? [];
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.loadError = err?.error?.message || genericError;
        }
      });
  }

  refresh(): void {
    this.load();
  }

  isPending(t: Testimonials): boolean {
    return String(t.status).toLowerCase() !== 'true';
  }

  targetLabel(t: Testimonials): string {
    if (t.trainerName) return t.trainerName;
    if (t.centerName) return t.centerName;
    return 'About Berliz';
  }

  writeAnother(): void {
    this.testimonialDialogService.openTestimonialForm();
  }

  startEdit(t: Testimonials): void {
    this.editingId = t.id;
    this.editError = null;
    this.editText = t.testimonial;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editError = null;
    this.editText = '';
  }

  saveEdit(t: Testimonials): void {
    const text = this.editText.trim();
    if (!text || this.saving) return;

    this.editError = null;
    this.saving = true;
    this.testimonialService.updateTestimonial({ id: t.id, testimonial: text })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.saving = false;
          this.editingId = null;
          this.load();
        },
        error: (err: any) => {
          this.saving = false;
          this.editError = err?.error?.message || genericError;
        }
      });
  }
}
