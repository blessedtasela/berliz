import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { MySubscriptionDetailModalComponent } from '../my-subscription-detail-modal/my-subscription-detail-modal.component';

@Component({
  selector: 'app-my-subscriptions',
  templateUrl: './my-subscriptions.component.html',
  styleUrls: ['./my-subscriptions.component.css']
})
export class MySubscriptionsComponent {
  @Input() mySubscriptions: Subscriptions[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalSubscriptions: number = 0;
  @Input() subscriptionsLength: number = 0;
  subscriptions: Subscription[] = []
  @Output() emitEvent = new EventEmitter()
  isSubscriptionChecked: boolean[] = [];
  menuOpen: boolean[] = Array(this.mySubscriptions.length).fill(false);
  showBulkAction: boolean = false;
  selectedSubscriptionIds: number[] = [];
  plans: any;

  constructor(private subscriptionStateService: SubscriptionStateService,
    private subscriptionService: SubscriptionService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,) { }

  ngOnInit(): void {
    console.log(this.mySubscriptions)
    this.ngxService.start();
    this.subscribeToCloseSubscriptionAction()
    this.isSubscriptionChecked = this.mySubscriptions.map(Subscription => Subscription.checked === true);
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.subscriptionStateService.getMySubscriptions().subscribe((mySubscriptions) => {
        this.mySubscriptions = mySubscriptions;
        this.totalSubscriptions = this.mySubscriptions.length;
        this.subscriptionsLength = mySubscriptions.length;
        this.mySubscriptions.forEach((Subscription) => {
          Subscription.checked = false;
          this.selectedSubscriptionIds = [];
        });
        this.subscriptionStateService.setMySubscriptionsSubject(mySubscriptions);
      }),
    );
  }

  openMenu(index: number) {
    // this.closeSubscriptionDropdown();
    this.menuOpen[index] = !this.menuOpen[index];
  }

  subscribeToCloseSubscriptionAction() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeBulkDropdown();
        this.closeSubscriptionDropdown();
      }
    });

  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('SubscriptionAction');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeSubscriptionDropdown() {
    this.menuOpen = Array(this.mySubscriptions.length).fill(false);
  }

  closeBulkDropdown() {
    this.showBulkAction = false;
  }

  unSelectAll() {
    this.mySubscriptions.forEach((Subscription) => {
      Subscription.checked = false;
    });
    this.selectedSubscriptionIds = [];
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  readSubscription(id: number) {
    const Subscription = this.mySubscriptions.find((s) => s.id === id);
    if (Subscription) {
      const dialogRef = this.dialog.open(MySubscriptionDetailModalComponent, {
        width: '700px',
        data: {
          mySubscriptions: Subscription
        }
      });
      const childComponentInstance = dialogRef.componentInstance as MySubscriptionDetailModalComponent;
      childComponentInstance.emitEvent.subscribe(() => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
          console.log('dialog opened');
        } else {
          console.log('Dialog closed without performing any action');
        }
      });
    } else {
      console.log('Subscription not found');
    }
  }

  deleteSubscription(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this Subscription? This is irreversible.";
    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.subscriptionService.deleteSubscription(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Subscription deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting Subscription');
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

  toggleBulkAction() {
    this.showBulkAction = !this.showBulkAction;
  }

  isSelectAllChecked(): boolean {
    if (!this.mySubscriptions || this.mySubscriptions.length === 0) {
      return false;
    }
    return this.mySubscriptions.every((Subscription) => Subscription.checked);
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.mySubscriptions.forEach((Subscription) => {
        Subscription.checked = true;
        this.selectedSubscriptionIds.push(Subscription.id);
      });
      console.log("is checked ", this.selectedSubscriptionIds);
    } else {
      this.mySubscriptions.forEach((Subscription) => {
        Subscription.checked = false;
      });
      this.selectedSubscriptionIds = [];
      console.log('unchecked ', this.selectedSubscriptionIds);
    }
  }

  toggleSelect(event: any, Subscription: Subscriptions) {
    const isChecked = event.target.checked;
    if (isChecked) {
      Subscription.checked = true;
      this.selectedSubscriptionIds.push(Subscription.id);
      console.log("is checked ", this.selectedSubscriptionIds);
    } else {
      Subscription.checked = false;
      this.selectedSubscriptionIds = this.selectedSubscriptionIds.filter((id) => id !== Subscription.id);
      console.log('unchecked ', this.selectedSubscriptionIds);
    }
  }

  submitBulkAction(action: string) {
    const dialogConfig = new MatDialogConfig();
    var message: any;
    if (action === 'delete') {
      message = 'delete selected these Subscriptions?';
    }
    if (action === 'true') {
      message = 'active selected Subscriptions?';
    }
    if (action === 'false') {
      message = 'deactive selected Subscriptions?';
    }
    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    // Convert array of IDs to a comma-separated string
    const idsString = this.selectedSubscriptionIds.join(',');
    const payload = {
      action: action,
      ids: idsString,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.subscriptionService.bulkAction(payload).subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit()
          this.closeBulkDropdown()
          this.unSelectAll();
          dialogRef.close('action completed successfully');
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without performing any action');
              this.closeBulkDropdown()
              this.unSelectAll();
            }
          });
        },
        (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        }
      );
    });
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? `${diffInSeconds} sec ago` : `${diffInSeconds} secs ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? `${diffInMinutes} min ago` : `${diffInMinutes} mins ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? `${diffInHours} hour ago` : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? `${diffInDays} day ago` : `${diffInDays} days ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    return diffInWeeks === 1 ? `${diffInWeeks} week ago` : `${diffInWeeks} weeks ago`;
  }

}



