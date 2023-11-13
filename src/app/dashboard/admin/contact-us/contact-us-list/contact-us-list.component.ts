import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateContactUsModalComponent } from '../update-contact-us-modal/update-contact-us-modal.component';
import { ContactUsStateService } from 'src/app/services/contact-us-state.service';
import { ContactUsDetailsComponent } from '../contact-us-details/contact-us-details.component';
import { ContactUsReviewModalComponent } from '../contact-us-review-modal/contact-us-review-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-contact-us-list',
  templateUrl: './contact-us-list.component.html',
  styleUrls: ['./contact-us-list.component.css']
})
export class ContactUsListComponent {
  responseMessage: any;
  @Input() contactUsData: ContactUs[] = [];
  showFullData: boolean = false;
  @Input() totalContactUs: number = 0;

  constructor(private datePipe: DatePipe,
    private contactUsService: ContactUsService,
    private contactUsStateService: ContactUsStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchGetContactUsFromMap()
    this.watchDeleteContactUs()
    this.watchReviewContactUs()
    this.watchUpdateContactUs()
    this.watchUpdateContactUsStatus()
  }


  handleEmitEvent() {
    this.contactUsStateService.getAllContactUs().subscribe((contactUs) => {
      this.ngxService.start()
      this.contactUsData = contactUs;
      this.totalContactUs = this.contactUsData.length
      this.contactUsStateService.setAllContactUsSubject(this.contactUsData);
      this.ngxService.stop()
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openContactUsDetails(id: number) {
    try {
      const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
      if (contactUs) {
        const dialogRef = this.dialog.open(ContactUsDetailsComponent, {
          width: '800px',
          minHeight: '400px',
          data: {
            contactUs: contactUs,
          }
        });
      } else {
        this.snackbarService.openSnackBar('contactUs not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check contactUs status", 'error');
    }
  }

  openUpdateContactUs(id: number) {
    try {
      const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
      if (contactUs) {
        const dialogRef = this.dialog.open(UpdateContactUsModalComponent, {
          width: '800px',
          height: '500px',
          data: {
            contactUsData: contactUs,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateContactUsModalComponent;
        childComponentInstance.onUpdateContactUsEmit.subscribe(() => {
          dialogRef.close('contact-us updated successfully')
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating contact-us entity');
          }
        });
      } else {
        this.snackbarService.openSnackBar('contactUs not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check contactUs status", 'error');
    }
  }

  updateContactUsStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
    if (contactUs?.status === 'true') {
      const message = 'make this contactUs pending?';

      dialogConfig.data = {
        message: message,
        confirmation: true,
      };
      const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
      const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
        this.ngxService.start();
        this.contactUsService.updateStatus(id)
          .subscribe((response: any) => {
            this.ngxService.stop();
            this.responseMessage = response.message;
            this.snackbarService.openSnackBar(this.responseMessage, '');
            dialogRef.close('ContactUs status updated successfully')
            this.handleEmitEvent()
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
    } else {
      const dialogRef = this.dialog.open(ContactUsReviewModalComponent, {
        width: '800px',
        height: '520px',
        data: {
          contactUs: contactUs,
        }
      });
      const childComponentInstance = dialogRef.componentInstance as ContactUsReviewModalComponent;
      childComponentInstance.onReviewContactUsEmit.subscribe(() => {
        dialogRef.close('contact-us reviewed successfully')
        this.handleEmitEvent()
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without reviewing message');
        }
      });
    }
  }

  deleteContactUs(id: number) {
    const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this contactUs? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.contactUsService.deleteContactUs(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('ContactUs deleted successfully')
          this.handleEmitEvent()
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

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchGetContactUsFromMap() {
    this.rxStompService.watch('/topic/getContactUsFromMap').subscribe((message) => {
      const receivedCategories: ContactUs = JSON.parse(message.body);
      this.contactUsData.push(receivedCategories);
    });
  }

  watchReviewContactUs() {
    this.rxStompService.watch('/topic/reviewContactUs').subscribe((message) => {
      const receivedContactUs: ContactUs = JSON.parse(message.body);
      const centerId = this.contactUsData.findIndex(contactUs => contactUs.id === receivedContactUs.id)
      this.contactUsData[centerId] = receivedContactUs
    });
  }

  watchUpdateContactUs() {
    this.rxStompService.watch('/topic/updateContactUs').subscribe((message) => {
      const receivedContactUs: ContactUs = JSON.parse(message.body);
      const centerId = this.contactUsData.findIndex(contactUs => contactUs.id === receivedContactUs.id)
      this.contactUsData[centerId] = receivedContactUs
    });
  }

  watchUpdateContactUsStatus() {
    this.rxStompService.watch('/topic/updateContactUsStatus').subscribe((message) => {
      const receivedContactUs: ContactUs = JSON.parse(message.body);
      const centerId = this.contactUsData.findIndex(contactUs => contactUs.id === receivedContactUs.id)
      this.contactUsData[centerId] = receivedContactUs
    });
  }

  watchDeleteContactUs() {
    this.rxStompService.watch('/topic/deleteContactUs').subscribe((message) => {
      const receivedContactUs: ContactUs = JSON.parse(message.body);
      this.contactUsData = this.contactUsData.filter(contactUs => contactUs.id !== receivedContactUs.id);
    });
  }

}

