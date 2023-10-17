import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent {
  user!: Users;
  responseMessage: any;
  subscription = new Subscription;

  constructor(
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService) { }


  ngOnInit(): void {
    this.userStateService.userData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.user = cachedData;
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }
  handleEmitEvent() {
    this.ngxService.start();
    this.subscription.add(
      this.userStateService.getUser().subscribe((user) => {
        this.user = user;
        this.userStateService.setUserSubject(user)
      }),
    );
    this.ngxService.stop()
  }

}
