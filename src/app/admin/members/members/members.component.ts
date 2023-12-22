import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Members } from 'src/app/models/members.interface';
import { MemberStateService } from 'src/app/services/member-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public memberStateService: MemberStateService) {
  }

  ngOnInit(): void {
    this.memberStateService.allMembersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.membersData = cachedData;
        this.totalMembers = cachedData.length
        this.membersLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.memberStateService.getAllMembers().subscribe((allMembers) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.membersData = allMembers;
      this.totalMembers = allMembers.length
      this.membersLength = allMembers.length
      this.memberStateService.setAllMembersSubject(this.membersData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Members[]): void {
    this.membersData = results;
    this.totalMembers = results.length;
  }

}
