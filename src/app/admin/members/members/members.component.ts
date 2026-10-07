import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Members } from 'src/app/models/members.interface';
import { loadMembers, loadMembersFailure, loadMembersSuccess } from 'src/app/state/member/member.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectMembers } from 'src/app/state/member/member.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-members',
    templateUrl: './members.component.html',
    styleUrls: ['./members.component.css'],
    standalone: false
})
export class MembersComponent {
  membersData: Members[] = [];
  totalMembers: number = 0;
  membersLength: number = 0;
  searchComponent: string = 'member'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectMembers = selectMembers;
  readonly memberSearchFields: AdminSearchField<Members>[] = [
    { value: 'name', label: 'Name', accessor: m => `${m.userFirstname || ''} ${m.userLastname || ''}` },
    { value: 'email', label: 'Email', accessor: m => m.userEmail },
    { value: 'id', label: 'Member id', accessor: m => m.id?.toString() },
    { value: 'status', label: 'Status', accessor: m => m.status },
  ];

  constructor(public store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadMembersFailure, [loadMembers, loadMembersSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadMembers());
    this.subscriptions.push(
      this.store.select(selectMembers).subscribe((allMembers) => {
        this.membersData = allMembers;
        this.totalMembers = allMembers.length
        this.membersLength = allMembers.length
      }),
    );
  }

  handleSearchResults(results: Members[]): void {
    this.membersData = results;
    this.totalMembers = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadMembers());
  }
}
