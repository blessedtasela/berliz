import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subject, takeUntil } from 'rxjs';
import { Partner } from 'src/app/models/partners.interface';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ViewCertificateModalComponent } from 'src/app/shared/view-certificate-modal/view-certificate-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { UpdatePartnerFileModalComponent } from 'src/app/shared/update-partner-file-modal/update-partner-file-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

/**
 * Routed detail page for a single partner — `/dashboard/partners/:id`
 * (also reachable via `/dashboard/hub/partners/:id`, same lazy module).
 *
 * Replaces the old PartnerDetailsModalComponent dialog. Looks the partner
 * up in the already-loaded `partners` slice and dispatches `loadPartners()`
 * if empty (direct link / refresh). The nested sub-actions (edit files,
 * view CV/certificate, reject application) still open their own modals —
 * only the top-level "view details" surface moved to a page.
 */
@Component({
  selector: 'app-partner-detail-page',
  templateUrl: './partner-detail-page.component.html',
  styleUrls: ['./partner-detail-page.component.css']
})
export class PartnerDetailPageComponent implements OnInit, OnDestroy {
  partnerData: Partner | null = null;
  loading = true;
  responseMessage: any;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private dialog: MatDialog,
    private partnerService: PartnerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.partnerData = null;
          return;
        }
        this.loadPartner(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPartner(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectPartners)
      .pipe(takeUntil(this.destroy$))
      .subscribe(partners => {
        const found = (partners || []).find(partner => partner.id === id);
        if (found) {
          this.partnerData = found;
          this.loading = false;
        } else if (!partners || partners.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadPartners());
          }
        } else {
          this.partnerData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  rejectApplication(id: number) {
    const dialogConfig = new MatDialogConfig();
    const partner = this.partnerData;
    const message = 'reject this partner\'s  appliaction as a ' + partner?.role;

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.ngxService.start();
      this.partnerService.rejectApplication(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Partner application rejected');
          this.loadPartner(id);
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  openUpdateFile() {
    if (!this.partnerData) return;
    try {
      const dialogRef = this.dialog.open(UpdatePartnerFileModalComponent, {
        width: '496px',
        maxWidth: '95vw',
        data: {
          partnerData: this.partnerData,
        }
      });
      const childComponentInstance = dialogRef.componentInstance as UpdatePartnerFileModalComponent;
      childComponentInstance.onUpdatePartnerFileEmit.subscribe(() => {
        this.loadPartner(this.partnerData!.id);
      });
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check partner status", 'error');
    }
  }

  openViewCertificate() {
    const partner = this.partnerData;
    if (partner) {
      this.dialog.open(ViewCertificateModalComponent, {
        width: '720px',
        maxWidth: '95vw',
        data: {
          partnerData: partner,
        },
        panelClass: 'mat-dialog-height',
      });
    }
  }

  openViewCV() {
    const partner = this.partnerData;
    if (partner) {
      this.dialog.open(ViewCvModalComponent, {
        width: '720px',
        maxWidth: '95vw',
        data: {
          partnerData: partner,
        },
        panelClass: 'mat-dialog-height',
      });
    }
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
