import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateEmailModalComponent } from '../update-email-modal/update-email-modal.component';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { DashboardStateService } from 'src/app/services/dashboard-state.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent {
  user!: Users;
  responseMessage: any;
  subscriptions: Subscription[] = [];
  profileData: any;

  constructor(
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private dashboardStateService: DashboardStateService) { }

  ngOnInit(): void {
    this.ngxService.start();
    this.handleEmitEvent()
    this.ngxService.stop();
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
    this.watchUpdateUserEmail()
    this.watchUpdateUserBio()
    this.watchGetTodoFromMap()
    this.watchTodoBulkAction()
    this.watchDeleteTodo()
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }


  handleEmitEvent() {
    this.subscriptions.push(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
      this.dashboardStateService.getProfileData().subscribe((data) => {
        this.profileData = data;
        this.dashboardStateService.setProfileDataSubject(data)
      })
    );
  }


  watchUpdateUserBio() {
    this.rxStompService.watch('/topic/updateUserBio').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUserEmail() {
    this.rxStompService.watch('/topic/updateUserEmail').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchGetTodoFromMap() {
    this.rxStompService.watch('/topic/getTodoFromMap').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchTodoBulkAction() {
    this.rxStompService.watch('/topic/todoBulkAction').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchDeleteTodo() {
    this.rxStompService.watch('/topic/deleteTodo').subscribe((message) => {
      this.handleEmitEvent();
    });
  }
}
