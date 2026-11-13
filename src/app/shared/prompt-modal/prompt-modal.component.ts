import { DialogRef } from '@angular/cdk/dialog';
import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PromptData } from 'src/app/models/Prompt.interface';

@Component({
    selector: 'app-prompt-modal',
    templateUrl: './prompt-modal.component.html',
    styleUrls: ['./prompt-modal.component.css'],
    standalone: false
})
export class PromptModalComponent implements OnInit {
  onEmitStatusChange = new EventEmitter();
  details!: PromptData;
  reason = '';

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: PromptData,
    public dialogRef: MatDialogRef<PromptModalComponent>) { }

  ngOnInit(): void {
    // `confirmation` just decides whether a Cancel button is offered alongside
    // Confirm/OK -- a plain informational alert (no confirmation) is just as
    // valid a use of this modal and shouldn't be dropped here.
    this.details = this.dialogData || {};
  }

  /** A plain "please log in" prompt must not read like a destructive one. */
  get isLoginPrompt(): boolean {
    return this.details?.icon === 'log-in';
  }

  get title(): string {
    const t = this.details?.title;
    if (this.isLoginPrompt && (!t || t === 'Login required')) return 'Log in to continue';
    return t || (this.details?.confirmation ? 'Are you sure?' : 'Heads up');
  }

  /** The line under the title: an explicit one, else the irreversible warning for destructive confirmations only. */
  get subtitle(): string | null {
    if (this.details?.subtitle) return this.details.subtitle;
    if (this.details?.confirmation && !this.isLoginPrompt) return 'This action may be irreversible';
    return null;
  }

  /** True once a required reason has actually been typed -- the confirm button stays disabled until then. */
  get canConfirm(): boolean {
    return !this.details?.requireReason || this.reason.trim().length > 0;
  }

  handleChangeAction() {
    if (!this.canConfirm) return;
    const result = this.details?.requireReason ? this.reason.trim() : true;
    this.onEmitStatusChange.emit(result);
    this.dialogRef.close(result);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}
