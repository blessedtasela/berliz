import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Payments } from 'src/app/models/payment.interface';
import { PaymentStateService } from 'src/app/services/payment-state.service';
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
    private paymentStateService: PaymentStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.paymentStateService.getAllPayments().subscribe((allPayments) => {
      this.ngxService.start()
      console.log('cached false')
      this.paymentsData = allPayments;
      this.totalPayments = this.paymentsData.length
      this.paymentsLength = this.paymentsData.length
      this.paymentStateService.setAllPaymentsSubject(this.paymentsData);
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
          return a.user.email.localeCompare(b.user.email);
        });
        break;
      case 'payer':
        this.paymentsData.sort((a, b) => {
          return (a.payer.firstname.localeCompare || a.user.lastname)(b.payer.firstname || b.user.lastname);
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

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      this.paymentsData = this.paymentsData.filter(payment => payment.id !== receivedCategories.id);
      this.paymentsLength = this.paymentsData.length;
      this.totalPayments = this.paymentsData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Payments = JSON.parse(message.body);
      this.paymentsData.push(receivedCategories);
      this.paymentsLength = this.paymentsData.length;
      this.totalPayments = this.paymentsData.length
    });
  }
}
