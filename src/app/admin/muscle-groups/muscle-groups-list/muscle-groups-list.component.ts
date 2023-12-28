import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { MuscleGroupStateService } from 'src/app/services/muscle-group-state.service';
import { MuscleGroupService } from 'src/app/services/muscle-group.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateMuscleGroupModalComponent } from '../update-muscle-group-modal/update-muscle-group-modal.component';
import { MuscleGroupDetailsModalComponent } from '../muscle-group-details-modal/muscle-group-details-modal.component';

@Component({
  selector: 'app-muscle-groups-list',
  templateUrl: './muscle-groups-list.component.html',
  styleUrls: ['./muscle-groups-list.component.css']
})
export class MuscleGroupsListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() muscleGroupsData: MuscleGroups[] = [];
  @Input() totalMuscleGroups: number = 0;
  selectedImage: any;

  constructor(private datePipe: DatePipe,
    private muscleGroupService: MuscleGroupService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public muscleGroupStateService: MuscleGroupStateService) {
  }

  ngOnInit() {
    this.watchUpdateMuscleGroup()
    this.watchUpdateStatus()
  }

  handleEmitEvent() {
    this.muscleGroupStateService.getMuscleGroups().subscribe((allMuscleGroups) => {
      this.ngxService.start()
      this.muscleGroupsData = allMuscleGroups;
      this.totalMuscleGroups = this.muscleGroupsData.length
      this.muscleGroupStateService.setAllMuscleGroupsSubject(this.muscleGroupsData);
      this.ngxService.stop()
    });
  }


  openUpdateCategory(id: number) {
    try {
      const muscleGroup = this.muscleGroupsData.find(muscleGroup => muscleGroup.id === id);
      if (muscleGroup) {
        const dialogRef = this.dialog.open(UpdateMuscleGroupModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            muscleGroupData: muscleGroup,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateMuscleGroupModalComponent;
        childComponentInstance.onUpdateMuscleGroupEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a muscleGroup');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('muscleGroup not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check muscleGroup status", 'error');
    }
  }

  openCategoryDetails(id: number) {
    try {
      const muscleGroup = this.muscleGroupsData.find(muscleGroup => muscleGroup.id === id);
      if (muscleGroup) {
        const dialogRef = this.dialog.open(MuscleGroupDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            muscleGroupData: muscleGroup,
          }
        });
      } else {
        this.snackbarService.openSnackBar('muscleGroup not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check muscleGroup status", 'error');
    }
  }

  updateCategoryStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const muscleGroup = this.muscleGroupsData.find(muscleGroup => muscleGroup.id === id);
    const message = muscleGroup?.status === 'false'
      ? 'activate this muscleGroup?'
      : 'deactivate this muscleGroup?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.muscleGroupService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('muscleGroup status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating muscleGroup status');
            }
          });
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

  deleteCategory(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this muscleGroup? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.muscleGroupService.deleteMuscleGroup(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('muscleGroup deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting muscleGroup');
            }
          });
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

  onImgSelected(event: any, id: number): void {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      this.selectedImage = selectedImage;
      this.updateImage(id);
    }
  }

  updateImage(id: number): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('image', this.selectedImage);
    requestData.append('id', id.toString());
    this.muscleGroupService.updateMuscleGroupImage(requestData)
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

  watchUpdateMuscleGroup() {
    this.rxStompService.watch('/topic/updateMuscleGroup').subscribe((message) => {
      const receivedCategories: MuscleGroups = JSON.parse(message.body);
      const categoryId = this.muscleGroupsData.findIndex(muscleGroup => muscleGroup.id === receivedCategories.id)
      this.muscleGroupsData[categoryId] = receivedCategories
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateMuscleGroupStatus').subscribe((message) => {
      const receivedCategories: MuscleGroups = JSON.parse(message.body);
      const categoryId = this.muscleGroupsData.findIndex(muscleGroup => muscleGroup.id === receivedCategories.id)
      this.muscleGroupsData[categoryId] = receivedCategories
    });
  }

}

