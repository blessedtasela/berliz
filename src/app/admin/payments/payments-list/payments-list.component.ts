import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Payments } from 'src/app/models/payment.interface';
import { PaymentStateService } from 'src/app/services/payment-state.service';
import { PaymentService } from 'src/app/services/payment.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdatePaymentsModalComponent } from '../update-payments-modal/update-payments-modal.component';
import { PaymentDetailsModalComponent } from '../payment-details-modal/payment-details-modal.component';

@Component({
  selector: 'app-payments-list',
  templateUrl: './payments-list.component.html',
  styleUrls: ['./payments-list.component.css']
})
export class PaymentsListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() paymentsData: Payments[] = [];
  @Input() totalPayments: number = 0;

  constructor(private datePipe: DatePipe,
    private paymentService: PaymentService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public paymentStateService: PaymentStateService) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  handleEmitEvent() {
    this.paymentStateService.getAllPayments().subscribe((allPayments) => {
      this.ngxService.start()
      this.paymentsData = allPayments;
      this.totalPayments = this.paymentsData.length
      this.paymentStateService.setAllPaymentsSubject(this.paymentsData);
      this.ngxService.stop()
    });
  }


  openUpdatePayment(id: number) {
    try {
      const payment = this.paymentsData.find(payment => payment.id === id);
      if (payment) {
        const dialogRef = this.dialog.open(UpdatePaymentsModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            paymentData: payment,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdatePaymentsModalComponent;
        childComponentInstance.onUpdatePaymentEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a payment');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('payment not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check payment status", 'error');
    }
  }

  openPaymentDetails(id: number) {
    try {
      const payment = this.paymentsData.find(payment => payment.id === id);
      if (payment) {
        const dialogRef = this.dialog.open(PaymentDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            paymentData: payment,
          }
        });
      } else {
        this.snackbarService.openSnackBar('payment not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check payment status", 'error');
    }
  }

  updatePaymentStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const payment = this.paymentsData.find(payment => payment.id === id);
    const message = payment?.status === 'false'
      ? 'activate this payment?'
      : 'deactivate this payment?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.paymentService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('payment status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating payment status');
            }
          })
        })
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
  }

  deletePayment(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this payment? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.paymentService.deletePayment(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('payment deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting payment');
            }
          })
        })
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
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      const categoryId = this.paymentsData.findIndex(payment => payment.id === receivedCategories.id)
      this.paymentsData[categoryId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      const categoryId = this.paymentsData.findIndex(payment => payment.id === receivedCategories.id)
      this.paymentsData[categoryId] = receivedCategories
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      this.paymentsData.push(receivedCategories);
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      const categoryId = this.paymentsData.findIndex(payment => payment.id === receivedCategories.id)
      this.paymentsData[categoryId] = receivedCategories
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      this.paymentsData = this.paymentsData.filter(payment => payment.id !== receivedCategories.id);
    });
  }

}

