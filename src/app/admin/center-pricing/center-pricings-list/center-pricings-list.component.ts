import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { CenterPricing } from 'src/app/models/centers.interface';
import { CenterService } from 'src/app/services/center.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { selectCenterPricing } from 'src/app/state/center/center.selectors';
import { loadAllCenterPricing } from 'src/app/state/center/center.actions';
import { UpdateCenterPricingsModalComponent } from '../update-center-pricings-modal/update-center-pricings-modal.component';

@Component({
  selector: 'app-center-pricings-list',
  templateUrl: './center-pricings-list.component.html',
  styleUrls: ['./center-pricings-list.component.css']
})
export class CenterPricingsListComponent implements OnInit, OnDestroy {
  responseMessage: any;
  @Input() centerPricingData: CenterPricing[] = [];
  @Input() totalCenterPricing: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private datePipe: DatePipe,
    private centerService: CenterService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    private router: Router,
    public store: Store) {
  }

  ngOnInit() {
    this.watchUpdateCenterPricing();
    this.watchDeleteCenterPricing();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadAllCenterPricing());
    this.store.select(selectCenterPricing).subscribe((centerPricing) => {
      this.centerPricingData = centerPricing;
      this.totalCenterPricing = this.centerPricingData.length;
    });
  }

  openUpdateCenterPricing(id: number) {
    try {
      const centerPricing = this.centerPricingData.find(centerPricing => centerPricing.id === id);
      if (centerPricing) {
        const dialogRef = this.dialog.open(UpdateCenterPricingsModalComponent, {
          width: '560px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            centerPricingData: centerPricing,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateCenterPricingsModalComponent;
        childComponentInstance.onUpdateCenterPricingEmit.subscribe(() => {
          this.handleEmitEvent();
        });
      } else {
        this.snackbarService.openSnackBar('centerPricing not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check centerPricing status", 'error');
    }
  }

  openCenterPricingDetails(id: number) {
    this.router.navigate(['/dashboard/center-pricing', id]);
  }

  deleteCenterPricing(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this center pricing? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.ngxService.start();
      this.centerService.deletePricing(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          dialogRef.close('centerPricing deleted successfully');
        }, (error) => {
          this.ngxService.stop();
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchUpdateCenterPricing() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateCenterPricing').subscribe((message) => {
        const received: CenterPricing = JSON.parse(message.body);
        const index = this.centerPricingData.findIndex(cp => cp.id === received.id);
        if (index !== -1) {
          this.centerPricingData[index] = received;
        }
      })
    );
  }

  watchDeleteCenterPricing() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/deleteCenterPricing').subscribe((message) => {
        const received: CenterPricing = JSON.parse(message.body);
        this.centerPricingData = this.centerPricingData.filter(cp => cp.id !== received.id);
        this.totalCenterPricing = this.centerPricingData.length;
      })
    );
  }
}
