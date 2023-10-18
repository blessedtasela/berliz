import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsStateService } from 'src/app/services/contact-us-state.service';

@Component({
  selector: 'app-admin-contact-us',
  templateUrl: './admin-contact-us.component.html',
  styleUrls: ['./admin-contact-us.component.css']
})
export class AdminContactUsComponent {
  contactUsData: ContactUs[] = [];
  totalContactUs: number = 0;
  contactUsLength: number = 0;
  searchComponent: string = 'contactUs'
  isSearch: boolean = true;

  constructor(private contactUsStateService: ContactUsStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,) {
  }

  ngOnInit(): void {
    this.contactUsStateService.allContacctUsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.contactUsData = cachedData;
        this.totalContactUs = cachedData.length
        this.contactUsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.contactUsStateService.getAllContactUs().subscribe((contactUs) => {
      console.log('isCachedData false')
      this.ngxService.start()
      this.contactUsData = contactUs;
      this.totalContactUs = contactUs.length
      this.contactUsLength = contactUs.length;
      this.contactUsStateService.setAallContactUsSubject(this.contactUsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: ContactUs[]): void {
    this.contactUsData = results;
    this.totalContactUs = results.length;
  }


}

