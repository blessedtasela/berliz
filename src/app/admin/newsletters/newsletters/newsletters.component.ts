import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Newsletter } from 'src/app/models/newsletter.model';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';

@Component({
  selector: 'app-newsletters',
  templateUrl: './newsletters.component.html',
  styleUrls: ['./newsletters.component.css']
})
export class NewslettersComponent {
  newsletterData: Newsletter[] = [];
  totalNewsletters: number = 0;
  newsletterLength: number = 0;
  searchComponent: string = 'newsletter'
  isSearch: boolean = true;

  constructor(private newsletterStateService: NewsletterStateService,
    private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,) {
  }

  ngOnInit(): void {
    this.newsletterStateService.allNewsletterData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.newsletterData = cachedData;
        this.totalNewsletters = cachedData.length
        this.newsletterLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      console.log('isCachedData false')
      this.ngxService.start()
      this.newsletterData = newsletter;
      this.totalNewsletters = newsletter.length
      this.newsletterLength = newsletter.length;
      this.newsletterStateService.setAllNewsletterSubject(this.newsletterData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Newsletter[]): void {
    this.newsletterData = results;
    this.totalNewsletters = results.length;
  }


}
