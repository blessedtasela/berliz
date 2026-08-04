import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Members } from 'src/app/models/members.interface';
import { loadMembers } from 'src/app/state/member/member.actions';
import { selectMembers } from 'src/app/state/member/member.selectors';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent {
  membersData: Members[] = [];
  totalMembers: number = 0;
  membersLength: number = 0;
  searchComponent: string = 'member'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadMembers());
    this.subscriptions.push(
      this.store.select(selectMembers).subscribe((allMembers) => {
        this.membersData = allMembers;
        this.totalMembers = allMembers.length
        this.membersLength = allMembers.length
        this.ngxService.stop()
      }),
    );
  }

  handleSearchResults(results: Members[]): void {
    this.membersData = results;
    this.totalMembers = results.length;
  }

}
