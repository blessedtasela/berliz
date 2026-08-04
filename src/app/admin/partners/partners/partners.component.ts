import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partner } from 'src/app/models/partners.interface';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.css']
})
export class PartnersComponent {
  partnersData: Partner[] = [];
  totalPartners: number = 0;
  partnersLength: number = 0;
  searchComponent: string = 'partner'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadPartners());
    this.subscriptions.push(
      this.store.select(selectPartners).subscribe((allPartners) => {
        this.partnersData = allPartners;
        this.totalPartners = allPartners.length
        this.partnersLength = allPartners.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Partner[]): void {
    this.partnersData = results;
    this.totalPartners = results.length;
  }

}
