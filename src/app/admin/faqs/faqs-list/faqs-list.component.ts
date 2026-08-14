import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Faq } from 'src/app/models/faq.model';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { deleteFaq, updateFaqStatus } from 'src/app/state/faq/faq.actions';
import { UpdateFaqModalComponent } from '../update-faq-modal/update-faq-modal.component';

@Component({
  selector: 'app-faqs-list',
  templateUrl: './faqs-list.component.html',
  styleUrls: ['./faqs-list.component.css']
})
export class FaqsListComponent {
  responseMessage: any;
  @Input() faqsData: Faq[] = [];
  @Input() totalFaqs: number = 0;

  constructor(
    private datePipe: DatePipe,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private store: Store) { }

  openUpdateFaq(id: number) {
    const faq = this.faqsData.find(f => f.id === id);
    if (!faq) {
      this.snackbarService.openSnackBar('FAQ not found for id: ' + id, 'error');
      return;
    }
    const dialogRef = this.dialog.open(UpdateFaqModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '600px',
      disableClose: true,
      data: { faqData: faq },
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateFaqModalComponent;
    childComponentInstance.onUpdateFaqEmit.subscribe(() => {
      // Store-driven list; the effect already patches faqsData via the parent's subscription.
    });
  }

  updateFaqStatus(id: number) {
    const faq = this.faqsData.find(f => f.id === id);
    const message = faq?.status === 'false' ? 'activate this FAQ?' : 'deactivate this FAQ?';

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = { message, confirmation: true, disableClose: true };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.ngxService.start();
      this.store.dispatch(updateFaqStatus({ id }));
      this.ngxService.stop();
      this.snackbarService.openSnackBar('FAQ status updated', '');
      dialogRef.close('FAQ status updated successfully');
    });
  }

  deleteFaq(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete this FAQ? This is irreversible.',
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.ngxService.start();
      this.store.dispatch(deleteFaq({ id }));
      this.ngxService.stop();
      this.snackbarService.openSnackBar('FAQ deleted', '');
      dialogRef.close('FAQ deleted successfully');
    });
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    return this.datePipe.transform(new Date(dateString), 'dd/MM/yyyy');
  }
}
