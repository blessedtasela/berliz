import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Newsletter } from 'src/app/models/newsletter.model';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NewsletterBulkMessageModalComponent } from '../newsletter-bulk-message-modal/newsletter-bulk-message-modal.component';
import { AddNewsletterModalComponent } from '../add-newsletter-modal/add-newsletter-modal.component';

@Component({
  selector: 'app-newsletter-header',
  templateUrl: './newsletter-header.component.html',
  styleUrls: ['./newsletter-header.component.css']
})
export class NewsletterHeaderComponent {
  selectedSortOption: string = 'date';
  @Input() newsletterData: Newsletter[] = [];
  @Input() totalNewsletters: number = 0;
  @Input() newsletterLength: number = 0;


  constructor(private newsletterStateService: NewsletterStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchDeleteNewsletter()
    this.watchGetNewsletterFromMap()
  }

  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      this.ngxService.start()
      this.newsletterData = newsletter;
      this.totalNewsletters = this.newsletterData.length
      this.newsletterLength = this.newsletterData.length
      this.newsletterStateService.setAllNewsletterSubject(this.newsletterData);
      this.ngxService.stop()
    });
  }

  sortNewsletterData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.newsletterData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'email':
        this.newsletterData.sort((a, b) => {
          return a.email.localeCompare(b.email);
        });
        break;
      case 'id':
        this.newsletterData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.newsletterData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortNewsletterData();
  }

  openAddNewsletter() {
    const dialogRef = this.dialog.open(AddNewsletterModalComponent, {
      width: '600px',
      height: '400px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddNewsletterModalComponent;
    childComponentInstance.onAddNewsletter.subscribe(() => {
      dialogRef.close('newsletter added successfully')
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a newsletter');
      }
    });
  }

  sendNewsletterBulkMessage() {
    const dialogRef = this.dialog.open(NewsletterBulkMessageModalComponent, {
      width: '800px',
      height: '520px',
    });
    const childComponentInstance = dialogRef.componentInstance as NewsletterBulkMessageModalComponent;
    childComponentInstance.onSendMessage.subscribe(() => {
      dialogRef.close('Newsletter bulk messages sent successfully')
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without sending newsletter bulk messages');
      }
    });
  }

  watchGetNewsletterFromMap() {
    this.rxStompService.watch('/topic/getNewsletterFromMap').subscribe((message) => {
      const receivedCategories: Newsletter = JSON.parse(message.body);
      this.newsletterData.push(receivedCategories);
      this.newsletterLength = this.newsletterData.length;
      this.totalNewsletters = this.newsletterData.length;
    });
  }

  watchDeleteNewsletter() {
    this.rxStompService.watch('/topic/deleteNewsletter').subscribe((message) => {
      const receivedNewsletter: Newsletter = JSON.parse(message.body);
      this.newsletterData = this.newsletterData.filter(newsletter => newsletter.id !== receivedNewsletter.id);
      this.newsletterLength = this.newsletterData.length;
      this.totalNewsletters = this.newsletterData.length;
    });
  }

}


