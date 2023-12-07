import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  userData!: any;
  currentRoute: any;

  constructor(
    private router: Router,
    private userStateService: UserStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.userStateService.userData$.subscribe((cachedData) => {
      if (cachedData === null) {
        this.handleEmitEvent()
      } else {
        this.userData = cachedData;
      }
    })
  }

  handleEmitEvent() {
    this.userStateService.getUser().subscribe((user) => {
      this.ngxService.start()
      console.log("isCached false")
      this.userData = user;
      this.userStateService.setUserSubject(this.userData);
      this.ngxService.stop()
    });
  }

}
