import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { UpdateTrainerModalComponent } from 'src/app/shared/update-trainer-modal/update-trainer-modal.component';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';
import { Users } from 'src/app/models/users.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.css']
})
export class TrainerComponent {

  trainerData!: Trainers;
  user!: Users;
  responseMessage: any;

  constructor(
    private userStateService: UserStateService,
    private partnerDataService: PartnerStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private trainerStateService: TrainerStateService,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    });
    this.trainerStateService.getTrainer().subscribe((trainer) => {
      this.trainerData = trainer;
    });
    this.ngxService.stop();
  }
      openUpdateTrainer() {
        const dialogRef = this.dialog.open(UpdateTrainerModalComponent, {
          width: '800px',
          data: {
            trainerData: this.trainerData,
          },
          panelClass: 'mat-dialog-height',
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerModalComponent;
        childComponentInstance.onUpdateTrainerEmit.subscribe(() => {
          this.handleEmitEvent();
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating partner');
          }
        });
      }
    
      openUpdateCoverPhoto() {
          const dialogRef = this.dialog.open(UpdateTrainerPhotoModalComponent, {
            width: '400px',
            data: {
              trainerData: this.trainerData,
            },
            panelClass: 'mat-dialog-height',
          });
          const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;
          childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
            this.handleEmitEvent();
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating partner');
            }
          });
        }
    
  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }
  
}
