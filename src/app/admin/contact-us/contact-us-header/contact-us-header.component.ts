import { Component, ElementRef, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUsFormComponent } from 'src/app/contact-us/contact-us-form/contact-us-form.component';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsStateService } from 'src/app/services/contact-us-state.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AddContactUsModalComponent } from '../add-contact-us-modal/add-contact-us-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-contact-us-header',
  templateUrl: './contact-us-header.component.html',
  styleUrls: ['./contact-us-header.component.css']
})
export class ContactUsHeaderComponent {
  selectedSortOption: string = 'date';
  @Input() contactUsData: ContactUs[] = [];
  @Input() totalContactUs: number = 0;
  @Input() contactUsLength: number = 0;


  constructor(private contactUsStateService: ContactUsStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchGetContactUsFromMap()
    this.watchDeleteContactUs()
  }

  handleEmitEvent() {
    this.contactUsStateService.getAllContactUs().subscribe((contactUs) => {
      this.ngxService.start()
      this.contactUsData = contactUs;
      this.totalContactUs = this.contactUsData.length
      this.contactUsLength = this.contactUsData.length
      this.contactUsStateService.setAllContactUsSubject(this.contactUsData);
      this.ngxService.stop()
    });
  }

  sortContactUsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.contactUsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'name':
        this.contactUsData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'email':
        this.contactUsData.sort((a, b) => {
          return a.email.localeCompare(b.email);
        });
        break;
      case 'id':
        this.contactUsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.contactUsData.sort((a, b) => {
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
    this.sortContactUsData();
  }

  openAddContactUs() {
    const dialogRef = this.dialog.open(AddContactUsModalComponent, {
      width: '800px',
      height: '600px'
    });
    const childComponentInstance = dialogRef.componentInstance as AddContactUsModalComponent;
    childComponentInstance.onAddContactUsEmit.subscribe(() => {
      dialogRef.close('contactUs added successfully')
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a contactUs');
      }
    });
  }

  watchGetContactUsFromMap() {
    this.rxStompService.watch('/topic/getContactUsFromMap').subscribe((message) => {
      const receivedCategories: ContactUs = JSON.parse(message.body);
      this.contactUsData.push(receivedCategories);
      this.contactUsLength = this.contactUsData.length;
      this.totalContactUs = this.contactUsData.length;
    });
  }

  watchDeleteContactUs() {
    this.rxStompService.watch('/topic/deleteContactUs').subscribe((message) => {
      const receivedContactUs: ContactUs = JSON.parse(message.body);
      this.contactUsData = this.contactUsData.filter(contactUs => contactUs.id !== receivedContactUs.id);
      this.contactUsLength = this.contactUsData.length;
      this.totalContactUs = this.contactUsData.length;
    });
  }
}

