import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partner } from 'src/app/models/partners.interface';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

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

  readonly selectPartners = selectPartners;
  readonly partnerSearchFields: AdminSearchField<Partner>[] = [
    { value: 'name', label: 'Name', accessor: p => `${p.firstname || ''} ${p.lastname || ''}` },
    { value: 'email', label: 'Email', accessor: p => p.email },
    { value: 'id', label: 'Partner id', accessor: p => p.id?.toString() },
    { value: 'role', label: 'Role', accessor: p => p.role },
    { value: 'status', label: 'Status', accessor: p => p.status },
  ];

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
