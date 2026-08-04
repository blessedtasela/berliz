import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Payments } from 'src/app/models/payment.interface';
import { loadPayments } from 'src/app/state/payment/payment.actions';
import { selectPayments } from 'src/app/state/payment/payment.selectors';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddPaymentsModalComponent } from '../add-payments-modal/add-payments-modal.component';

@Component({
  selector: 'app-payments-header',
  templateUrl: './payments-header.component.html',
  styleUrls: ['./payments-header.component.css']
})
export class PaymentsHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() paymentsData: Payments[] = [];
  @Input() totalPayments: number = 0;
  @Input() paymentsLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    public store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeletePayment()
    this.watchAddPayment()
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadPayments());
    this.store.select(selectPayments).subscribe((allPayments) => {
      this.paymentsData = allPayments;
      this.totalPayments = this.paymentsData.length
      this.paymentsLength = this.paymentsData.length
      this.ngxService.stop()
    });
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.paymentsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'email':
        this.paymentsData.sort((a, b) => {
          return a.userEmail.localeCompare(b.userEmail);
        });
        break;
      case 'payer':
        this.paymentsData.sort((a, b) => {
          return a.payerEmail.localeCompare(b.payerEmail);
        });
        break;
      case 'method':
        this.paymentsData.sort((a, b) => {
          return a.paymentMethod.localeCompare(b.paymentMethod);
        });
        break;
      case 'id':
        this.paymentsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.paymentsData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortCategoriesData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddPayment() {
    const dialogRef = this.dialog.open(AddPaymentsModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddPaymentsModalComponent;
    childComponentInstance.onAddPaymentEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a payment');
      }
    });
  }

  watchDeletePayment() {
    this.rxStompService.watch('/topic/deletePayment').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchAddPayment() {
    this.rxStompService.watch('/topic/addPayment').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}
