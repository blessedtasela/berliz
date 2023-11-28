import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SignupModalComponent } from 'src/app/dashboard/user/signup-modal/signup-modal.component';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.css']
})
export class UserHeaderComponent {
  selectedSortOption: string = 'date';
  @Input() usersData: Users[] = [];
  @Input() totalUsers: number = 0;
  @Input() usersLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteUser()
    this.watchGetUserFromMap()
  }

  handleEmitEvent() {
    this.userStateService.getAllUsers().subscribe((allUsers) => {
      this.ngxService.start()
      this.usersData = allUsers;
      this.totalUsers = this.usersData.length
      this.usersLength = this.usersData.length
      this.userStateService.setAllUsersSubject(this.usersData);
      this.ngxService.stop()
    });
  }

  sortUsersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.usersData.sort((a, b) => {
          return b.date.localeCompare(a.date);
        });
        break;
      case 'name':
        this.usersData.sort((a, b) => {
          return a.firstname.localeCompare(b.firstname);
        });
        break;
      case 'email':
        this.usersData.sort((a, b) => {
          return a.email.localeCompare(b.email);
        });
        break;
      case 'id':
        this.usersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      default:
        this.usersData.sort((a, b) => {
          return b.date.localeCompare(a.date);
        });
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortUsersData();
  }

  openSignup() {
    const dialogRef = this.dialog.open(SignupModalComponent, {
      width: '900px',
      height: '600px',
    });
    const childComponentInstance = dialogRef.componentInstance as SignupModalComponent;
    childComponentInstance.onSignupEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a user');
      }
    });
  }

  watchGetUserFromMap() {
    this.rxStompService.watch('/topic/getUserFromMap').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      this.usersData.push(receivedUsers);
      this.usersLength = this.usersData.length;
      this.totalUsers = this.usersData.length;
    });
  }

  watchDeleteUser() {
    this.rxStompService.watch('/topic/deleteUser').subscribe((message) => {
      const receivedUsers: Users = JSON.parse(message.body);
      this.usersData = this.usersData.filter(Users => Users.id !== receivedUsers.id);
      this.usersLength = this.usersData.length;
      this.totalUsers = this.usersData.length;
    });
  }
}