import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { Centers, CenterMember } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadMyCenterMembers } from 'src/app/state/center/center.actions';
import { selectMyCenterMembers } from 'src/app/state/center/center.selectors';
import { memoizePhotoUriByKey } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { genericError } from 'src/validators/form-validators.module';

/** A gym-roster entry -- separate from a Subscription/payment and from trainer affiliation
 *  (see CenterTrainersComponent, the structural twin this mirrors). The member must already be
 *  a Berliz user; there is no invite-by-email-for-a-non-user flow. */
@Component({
    selector: 'app-center-members',
    templateUrl: './center-members.component.html',
    styleUrls: ['./center-members.component.css'],
    standalone: false
})
export class CenterMembersComponent implements OnInit, OnDestroy {

  @Input() center!: Centers | null;
  @Output() emitEvent = new EventEmitter();

  centerMembers: CenterMember[] = [];
  addMemberForm!: FormGroup;

  showEditor = false;
  invalidForm = false;
  submitError: string | null = null;
  originalValue: any;

  showAll = false;
  visibleCount = 8;

  private subscriptions: Subscription[] = [];
  private _photoUri = memoizePhotoUriByKey();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private centerService: CenterService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    if (!this.addMemberForm) {
      this.initForm();
    }
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadMyCenterMembers());
    this.subscriptions.push(
      this.store.select(selectMyCenterMembers).subscribe(members => {
        this.centerMembers = members ?? [];
      })
    );
  }

  private initForm(): void {
    this.addMemberForm = this.fb.group({
      memberEmail: ['', [Validators.required, Validators.email]],
    });

    this.addMemberForm.markAsPristine();
    this.addMemberForm.markAsUntouched();
    this.originalValue = this.addMemberForm.getRawValue();
  }

  get visibleMembers(): CenterMember[] {
    return this.showAll ? this.centerMembers : this.centerMembers.slice(0, this.visibleCount);
  }

  get activeCount(): number {
    return this.centerMembers.filter(m => this.isActive(m.status)).length;
  }

  isActive(status: string): boolean {
    return status?.toLowerCase() === 'true' || status?.toLowerCase() === 'active';
  }

  photoSrc(member: CenterMember): string | null {
    return this._photoUri(member.id, member.memberPhoto);
  }

  hasChanges(): boolean {
    if (!this.addMemberForm) return false;
    return JSON.stringify(this.addMemberForm.getRawValue()) !== JSON.stringify(this.originalValue);
  }

  toggleEditor(): void {
    this.showEditor = !this.showEditor;
    this.invalidForm = false;
    this.submitError = null;
    this.initForm();
  }

  addMember(): void {
    this.submitError = null;
    if (this.addMemberForm.invalid) {
      this.invalidForm = true;
      this.addMemberForm.markAllAsTouched();
      return;
    }

    this.loader.start();
    this.centerService.addMember(this.addMemberForm.getRawValue()).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Member added to your center', '');
        this.store.dispatch(loadMyCenterMembers());
        this.emitEvent.emit();
        this.showEditor = false;
        this.invalidForm = false;
        this.initForm();
        this.loader.stop();
      },
      error: (err: any) => {
        this.submitError = err?.error?.message || genericError;
        this.loader.stop();
      }
    });
  }

  toggleStatus(member: CenterMember): void {
    this.loader.start();
    this.centerService.updateMemberStatus(member.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Member status updated', '');
        this.store.dispatch(loadMyCenterMembers());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  removeMember(member: CenterMember): void {
    this.loader.start();
    this.centerService.removeMember(member.id).pipe(take(1)).subscribe({
      next: (response: any) => {
        this.snackbar.openSnackBar(response?.message || 'Member removed', '');
        this.store.dispatch(loadMyCenterMembers());
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd MMM yyyy') ?? '—';
  }
}
