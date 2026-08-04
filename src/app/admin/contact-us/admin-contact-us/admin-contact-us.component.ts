import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ContactUs } from 'src/app/models/contact-us.model';
import { loadContactUs } from 'src/app/state/contact-us/contact-us.actions';
import { selectContactUsList } from 'src/app/state/contact-us/contact-us.selectors';

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
  subscriptions: Subscription[] = [];

  constructor(private store: Store,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadContactUs());
    this.subscriptions.push(
      this.store.select(selectContactUsList).subscribe((contactUs) => {
        this.contactUsData = contactUs;
        this.totalContactUs = contactUs.length
        this.contactUsLength = contactUs.length;
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: ContactUs[]): void {
    this.contactUsData = results;
    this.totalContactUs = results.length;
  }


}
