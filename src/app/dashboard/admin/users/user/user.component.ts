import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent {
  usersData: Users[] = [];
  totalUsers: number = 0;
  usersLength: number = 0;
  searchComponent: string = 'user'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public userStateService: UserStateService) {
  }

  ngOnInit(): void {
    this.userStateService.allUsersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.usersData = cachedData;
        this.totalUsers = cachedData.length
        this.usersLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.userStateService.getAllUsers().subscribe((allUsers) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.usersData = allUsers;
      this.totalUsers = allUsers.length
      this.usersLength = allUsers.length
      this.userStateService.setAllUsersSubject(this.usersData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Users[]): void {
    this.usersData = results;
    this.totalUsers = results.length;
  }

}
