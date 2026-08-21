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
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule],
  templateUrl: './my-testimonials-page.component.html',
  styleUrls: ['./my-testimonials-page.component.css']
})
export class MyTestimonialsPageComponent implements OnInit {

  testimonials: Testimonials[] = [];
  loading = true;

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

  private load(): void {
    this.loading = true;
    this.testimonialService.getMyTestimonials()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.testimonials = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.openSnackBar(genericError, 'error');
        }
      });
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
    this.editText = t.testimonial;
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editText = '';
  }

  saveEdit(t: Testimonials): void {
    const text = this.editText.trim();
    if (!text || this.saving) return;

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
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        }
      });
  }
}
