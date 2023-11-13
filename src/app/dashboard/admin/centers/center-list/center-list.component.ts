import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { Subscription } from 'rxjs';
import { UpdateCentersComponent } from '../update-centers/update-centers.component';
import { CenterDetailsComponent } from '../center-details/center-details.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-center-list',
  templateUrl: './center-list.component.html',
  styleUrls: ['./center-list.component.css']
})
export class CenterListComponent {
  @Input() centerData: Centers[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalCenters: number = 0;
  subscriptions: Subscription[] = []
  @Output() emitEvent = new EventEmitter()
  selectedImage: any;

  constructor(private centerStateService: CenterStateService,
    private centerService: CenterService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchDeleteCenter()
    this.watchGetCenterFromMap()
    this.watchLikeCenter()
    this.watchUpdateCenter()
    this.watchUpdateCenterStatus()
    this.watchUpdatePhoto()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }
  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.centerStateService.getAllCenters().subscribe((center) => {
        this.centerData = center;
        this.totalCenters = this.centerData.length;
        this.centerStateService.setAllCentersSubject(this.centerData);
      }),
    );
    this.ngxService.stop();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }


  openUpdateCenter(id: number) {
    try {
      const center = this.centerData.find(center => center.id === id);
      if (center) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '800px',
          dialogConfig.height = '600px',
          dialogConfig.data = { centerData: center }
        const dialogRef = this.dialog.open(UpdateCentersComponent, dialogConfig);
        const childComponentInstance = dialogRef.componentInstance as UpdateCentersComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdateCenterEmit.subscribe(() => {
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
        this.snackbarService.openSnackBar('center not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check center status", 'error');
    }
  }

  openCenterDetails(id: number) {
    const center = this.centerData.find(center => center.id === id);
    if (center) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '800px',
        dialogConfig.height = '600px',
        dialogConfig.data = { centerData: center }
      const dialogRef = this.dialog.open(CenterDetailsComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  updateCenterStatus(id: number) {
    console.log('inside updateCenterStatus');
    const dialogConfig = new MatDialogConfig();
    const center = this.centerData.find((c) => c.id === id);

    if (center) {
      console.log('inside center: ', center);
      const message =
        center?.status === 'false'
          ? 'activate this center\'s account?'
          : 'deactivate this center\'s account?';

      dialogConfig.data = {
        message: message,
        confirmation: true,
        disableClose: true,
      };

      const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
      const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
        // Start ngxService when making the API request
        this.ngxService.start();

        this.centerService.updateStatus(id).subscribe(
          (response: any) => {
            // API response received, stop ngxService
            this.ngxService.stop();

            this.responseMessage = response.message;
            this.snackbarService.openSnackBar(this.responseMessage, '');
            this.handleEmitEvent();

            dialogRef.close('Center status updated successfully');
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                console.log(`Dialog result: ${result}`);
              } else {
                console.log('Dialog closed without updating center status');
              }
            });
          },
          (error) => {
            // API request failed, stop ngxService and handle errors
            this.ngxService.stop();

            this.snackbarService.openSnackBar(error, 'error');
            if (error.error?.message) {
              this.responseMessage = error.error?.message;
            } else {
              this.responseMessage = genericError;
            }
            this.snackbarService.openSnackBar(this.responseMessage, 'error');
          }
        );
      });
    } else {
      console.log('Center id not found');
    }
  }


  deleteCenter(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this center? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.centerService.deleteCenter(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Center deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting center');
            }
          })
        })
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
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  onImgSelected(event: any, id: number): void {
    const selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
    this.selectedImage = selectedImage
    this.updatePhoto(id);
  }

  updatePhoto(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('photo', this.selectedImage);
    requestData.append('id', id.toString());
    this.centerService.updatePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  watchGetCenterFromMap() {
    this.rxStompService.watch('/topic/getCenterFromMap').subscribe((message) => {
      const receivedCategories: Centers = JSON.parse(message.body);
      this.centerData.push(receivedCategories);
    });
  }

  watchLikeCenter() {
    this.rxStompService.watch('/topic/likeCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centerData.findIndex(center => center.id === receivedCenter.id)
      this.centerData[centerId] = receivedCenter
    });
  }

  watchUpdateCenter() {
    this.rxStompService.watch('/topic/updateCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centerData.findIndex(center => center.id === receivedCenter.id)
      this.centerData[centerId] = receivedCenter
    });
  }

  watchUpdateCenterStatus() {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centerData.findIndex(center => center.id === receivedCenter.id)
      this.centerData[centerId] = receivedCenter
    });
  }

  watchUpdatePhoto() {
    this.rxStompService.watch('/topic/updateCenterPhoto').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centerData.findIndex(center => center.id === receivedCenter.id)
      this.centerData[centerId] = receivedCenter
    });
  }

  watchDeleteCenter() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      this.centerData = this.centerData.filter(center => center.id !== receivedCenter.id);
    });
  }
}

