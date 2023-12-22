import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  userData!: any;
  currentRoute: any;

  constructor(private router: Router,
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
