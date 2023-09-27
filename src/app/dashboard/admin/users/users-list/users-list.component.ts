import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { genericError } from 'src/validators/form-validators.module';
import { AdminUpdateUserModalComponent } from '../admin-update-user-modal/admin-update-user-modal.component';
import { AdminUpdateUserProfilePhotoModalComponent } from '../admin-update-user-profile-photo-modal/admin-update-user-profile-photo-modal.component';
import { UpdateUserRoleModalComponent } from '../update-user-role-modal/update-user-role-modal.component';
import { Users } from 'src/app/models/users.interface';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserDataService } from 'src/app/services/user-data.service';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { SignupModalComponent } from 'src/app/dashboard/user/signup-modal/signup-modal.component';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent {
  usersData: Users[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredUsersData: Users[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalUsers: number = 0;
  results: EventEmitter<Users[]> = new EventEmitter<Users[]>()

  constructor(private userDataService: UserDataService,
    private userService: UserService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
   this.handleEmitEvent();
  }

  handleEmitEvent(){
    this.ngxService.start();
    this.userDataService.getAllUsers().subscribe(() => {
      // Now that user data is available, initialize the search and event listener
      this.initializeSearch();
      this.usersData = this.userDataService.usersData;
      this.filteredUsersData = this.usersData
      this.counter = this.filteredUsersData.length
      this.totalUsers = this.usersData.length;
    });
    this.ngxService.stop()
  }

  initializeSearch(): void {
    // Your search initialization code here
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
        })
      )
      .subscribe(
        (results: Users[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  sortUsersData() {
    switch (this.selectedSortOption) {
      case 'date':
        // Sort by date (assuming date is a property of each user)
        this.filteredUsersData.sort((a, b) => {
          return b.date.localeCompare(a.date);
        });
        break;

      case 'name':
        this.filteredUsersData.sort((a, b) => {
          return a.firstname.localeCompare(b.firstname);
        });
        break;

      case 'id':
        this.filteredUsersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.filteredUsersData.sort((a, b) => {
          return b.date.localeCompare(a.date);
        });
        break;
    }
  }

  search(query: string): Observable<Users[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredUsersData = this.usersData;
      this.counter = this.filteredUsersData.length;
      return of(this.filteredUsersData);
    }
    // Filter your data based on the selected criteria and search query
    this.filteredUsersData = this.usersData.filter((user: Users) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return (
            user.firstname.toLowerCase().includes(query) ||
            user.lastname.toLowerCase().includes(query)
          );
        case 'id':
          return user.id.toString().includes(query);
        case 'role':
          return user.role.toLowerCase().includes(query);
        case 'status':
          return user.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredUsersData.length;
    return of(this.filteredUsersData);
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortUsersData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openSignup() {
    const dialogRef = this.dialog.open(SignupModalComponent, {
      width: '800px'
    });
    const childComponentInstance = dialogRef.componentInstance as SignupModalComponent;

    // Set the event emitter before opening the dialog
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

  openUpdateUser(id: number) {
    try {
      const user = this.usersData.find(user => user.id === id);
      if (user) {
        const dialogRef = this.dialog.open(AdminUpdateUserModalComponent, {
          width: '800px',
          data: {
            userData: user,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as AdminUpdateUserModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateUserEmit.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('User not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check user status", 'error');
    }
  }

  openUpdateUserRole(id: number) {
    try {
      const user = this.usersData.find(user => user.id === id);
      if (user) {
        const dialogRef = this.dialog.open(UpdateUserRoleModalComponent, {
          width: '400px',
          data: {
            userData: user,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateUserRoleModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateUserRole.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updatig user\'s role');
          }
        });
      } else {
        this.snackbarService.openSnackBar('User not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check user status", 'error');
    }
  }

  openUpdateProfilePhoto(id: number) {
    try {
      const user = this.usersData.find(user => user.id === id);
      if (user) {
        const userId = user.id;
        const profilePhoto = 'data:image/jpeg;base64,' + user.profilePhoto.photo;
        const dialogRef = this.dialog.open(AdminUpdateUserProfilePhotoModalComponent, {
          width: '400px',
          data: {
            photo: profilePhoto,
            id: userId,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as AdminUpdateUserProfilePhotoModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateUserProfilePhoto.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updatig user\'s profile photo');
          }
        });
      } else {
        this.snackbarService.openSnackBar('User not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check user status", 'error');
    }
  }

  updateUserStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const user = this.usersData.find(user => user.id === id);
    const message = user?.status === 'false'
      ? 'activate this user\'s account?'
      : 'deactivate this user\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          dialogRef.close('User status updated succesfully')
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  openUserDetails(id: number) {
    const user = this.usersData.find(user => user.id === id);
    const dialogRef = this.dialog.open(UserDetailsComponent, {
      width: '800px',
      data: {
        userData: user,
        photo: 'data:image/jpeg;base64,' + user?.profilePhoto.photo
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UserDetailsComponent;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without any action');
      }
    });
  }

  deleteUser(id: number) {
    const user = this.usersData.find(user => user.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this user. This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.userService.deleteUser(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
