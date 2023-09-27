import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DashboardService } from 'src/app/services/dashboard.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import jwt_decode from "jwt-decode";

@Component({
  selector: 'app-dashboard-details',
  templateUrl: './dashboard-details.component.html',
  styleUrls: ['./dashboard-details.component.css']
})
export class DashboardDetailsComponent implements OnInit {
  data: any;
  responseMessage: any;
  allData: any;
  token: any = localStorage.getItem('token')
  tokenPayload: any
  userRole: any

  constructor(private ngxService: NgxUiLoaderService,
    private dashboardService: DashboardService,
    private snackbarService: SnackBarService) {
    this.ngxService.start();
    this.tokenPayload = jwt_decode(this.token);
    this.userRole = this.tokenPayload?.role
  }


  formatUrl(name: any): any {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  ngOnInit(): void {
    this.getDashBoard();
  }

  showAllData() {
    this.allData == !this.allData;
  }

  getDashBoard() {
    this.ngxService.stop();
    this.dashboardService.getDetails()
      .subscribe((response: any) => {
        this.data = response;
      }, (error) => {
        this.ngxService.stop();
        console.log(error)
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      })
  }
}
