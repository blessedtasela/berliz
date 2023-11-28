import { DatePipe } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { NewsletterComponent } from 'src/app/footer/newsletter/newsletter.component';
import { Newsletter } from 'src/app/models/newsletter.model';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateNewsletterModalComponent } from '../update-newsletter-modal/update-newsletter-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NewsletterMessageModalComponent } from '../newsletter-message-modal/newsletter-message-modal.component';

@Component({
  selector: 'app-newsletter-list',
  templateUrl: './newsletter-list.component.html',
  styleUrls: ['./newsletter-list.component.css']
})
export class NewsletterListComponent {
  responseMessage: any;
  @Input() newsletterData: Newsletter[] = [];
  showFullData: boolean = false;
  @Input() totalNewsletters: number = 0;
  subscription = new Subscription;

  constructor(private datePipe: DatePipe,
    private newsletterService: NewsletterService,
    private newsletterStateService: NewsletterStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchDeleteNewsletter()
    this.watchGetNewsletterFromMap()
    this.watchUpdateNewsletter()
    this.watchUpdateNewsletterStatus()
  }


  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      this.ngxService.start()
      this.newsletterData = newsletter;
      this.totalNewsletters = this.newsletterData.length
      this.newsletterStateService.setAllNewsletterSubject(this.newsletterData);
      this.ngxService.stop()
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddNewsletter() {
    const dialogRef = this.dialog.open(NewsletterComponent, {
      width: '500px'
    });
    const childComponentInstance = dialogRef.componentInstance as NewsletterComponent;
    childComponentInstance.onAddNewsletterEmit.subscribe(() => {
      dialogRef.close('Newsletter added successfully')
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a newsletter');
      }
    });
  }

  openUpdateNewsletter(id: number) {
    try {
      const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
      if (newsletter) {
        const dialogRef = this.dialog.open(UpdateNewsletterModalComponent, {
          width: '400px',
          data: {
            newsletterData: newsletter,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateNewsletterModalComponent;
        childComponentInstance.onUpdateNewsletter.subscribe(() => {
          dialogRef.close('Newsletter status updated successfully')
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating newsletter');
          }
        });
      } else {
        this.snackbarService.openSnackBar('newsletter not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check newsletter status", 'error');
    }
  }

  updateNewsletterStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
    const message = newsletter?.status === 'false'
      ? 'activate this newsletter?'
      : 'deactivate this newsletter?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.newsletterService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Newsletter status updated successfully')
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

  deleteNewsletter(id: number) {
    const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this newsletter? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.newsletterService.deleteNewsletter(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Newsletter deleted successfully')
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

  sendNewsletterMessage(email: string) {
    try {
      const newsletter = this.newsletterData.find(newsletter => newsletter.email === email);
      if (newsletter) {
        const dialogRef = this.dialog.open(NewsletterMessageModalComponent, {
          width: '800px',
          height: '600px',
          data: {
            newsletterData: newsletter,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as NewsletterMessageModalComponent;
        childComponentInstance.onSendMessage.subscribe(() => {
          dialogRef.close('Newsletter message sent successfully')
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without sending newsletter message');
          }
        });
      } else {
        this.snackbarService.openSnackBar('newsletter not found for : ' + email, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check newsletter status", 'error');
    }
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchGetNewsletterFromMap() {
    this.rxStompService.watch('/topic/getNewsletterFromMap').subscribe((message) => {
      const receivedCategories: Newsletter = JSON.parse(message.body);
      this.newsletterData.push(receivedCategories);
    });
  }

  watchUpdateNewsletter() {
    this.rxStompService.watch('/topic/updateNewsletter').subscribe((message) => {
      const receivedNewsletter: Newsletter = JSON.parse(message.body);
      const newsletterId = this.newsletterData.findIndex(newsletter => newsletter.id === receivedNewsletter.id)
      this.newsletterData[newsletterId] = receivedNewsletter
    });
  }

  watchUpdateNewsletterStatus() {
    this.rxStompService.watch('/topic/updateNewsletterStatus').subscribe((message) => {
      const receivedNewsletter: Newsletter = JSON.parse(message.body);
      const newsletterId = this.newsletterData.findIndex(newsletter => newsletter.id === receivedNewsletter.id)
      this.newsletterData[newsletterId] = receivedNewsletter
    });
  }

  watchDeleteNewsletter() {
    this.rxStompService.watch('/topic/deleteNewsletter').subscribe((message) => {
      const receivedNewsletter: Newsletter = JSON.parse(message.body);
      this.newsletterData = this.newsletterData.filter(newsletter => newsletter.id !== receivedNewsletter.id);
    });
  }

}
