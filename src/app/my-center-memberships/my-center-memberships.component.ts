import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { CenterMember } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { nameSlug } from 'src/app/utils/closest-slug';
import { genericError } from 'src/validators/form-validators.module';

/** The signed-in user's own view: every center they personally belong to as a member --
 *  distinct from CenterMembersComponent, which is the center owner managing their roster. */
@Component({
  selector: 'app-my-center-memberships',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, LoadErrorComponent],
  providers: [DatePipe],
  templateUrl: './my-center-memberships.component.html',
})
export class MyCenterMembershipsComponent implements OnInit {

  memberships: CenterMember[] = [];
  loading = true;
  loadError: string | null = null;

  constructor(
    private centerService: CenterService,
    private snackBar: SnackBarService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.centerService.getMyCenterMemberships().pipe(take(1)).subscribe({
      next: res => { this.memberships = res?.data ?? []; this.loading = false; },
      error: err => {
        this.loading = false;
        const message = err?.error?.message || genericError;
        this.loadError = message;
        this.snackBar.openSnackBar(message, 'error');
      },
    });
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  centerSlug(name: string): string {
    return nameSlug(name);
  }

  formatDate(date: unknown): string {
    return this.datePipe.transform(new Date(date as string), 'mediumDate') ?? '';
  }
}
