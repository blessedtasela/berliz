import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UpdateTrainerPricingModalComponent } from '../update-trainer-pricing-modal/update-trainer-pricing-modal.component';
import { TrainerPricingDetailsModalComponent } from '../trainer-pricing-details-modal/trainer-pricing-details-modal.component';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-trainer-pricing-list',
  templateUrl: './trainer-pricing-list.component.html',
  styleUrls: ['./trainer-pricing-list.component.css']
})
export class TrainerPricingListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() trainerPricingData: TrainerPricing[] = [];
  @Input() totalTrainerPricing: number = 0;

  constructor(private datePipe: DatePipe,
    private trainerService: TrainerService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public trainerStateService: TrainerStateService,
    private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.ngxService.start()
    this.watchUpdateTrainerPricing()
    this.watchDeleteTrainerPricing()
    this.ngxService.stop()
    // this.watchGetTrainerPricingFromMap()
  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainerPricing().subscribe((trainerPricing) => {
      this.trainerPricingData = trainerPricing;
      this.totalTrainerPricing = this.trainerPricingData.length
    });
  }


  openUpdateTrainerPricing(id: number) {
    try {
      const trainerPricing = this.trainerPricingData.find(trainerPricing => trainerPricing.id === id);
      if (trainerPricing) {
        const dialogRef = this.dialog.open(UpdateTrainerPricingModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            trainerPricingData: trainerPricing,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPricingModalComponent;
        childComponentInstance.onUpdateTrainerPricingEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a trainerPricing');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('trainerPricing not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check trainerPricing status", 'error');
    }
  }

  openTrainerPricingDetails(id: number) {
    try {
      const trainerPricing = this.trainerPricingData.find(trainerPricing => trainerPricing.id === id);
      if (trainerPricing) {
        const dialogRef = this.dialog.open(TrainerPricingDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            trainerPricingData: trainerPricing,
          }
        });
      } else {
        this.snackbarService.openSnackBar('trainerPricing not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check trainerPricing status", 'error');
    }
  }

  deleteTrainerPricing(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this trainerPricing? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.trainerService.deleteTrainerPricing(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('trainerPricing deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting trainerPricing');
            }
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
    })
    this.ngxService.stop();
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchUpdateTrainerPricing() {
    this.rxStompService.watch('/topic/updateTrainerPricing').subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      const categoryId = this.trainerPricingData.findIndex(trainerPricing => trainerPricing.id === receivedCategories.id)
      this.trainerPricingData[categoryId] = receivedCategories
    });
  }

  watchDeleteTrainerPricing() {
    // Subscribe to the common topic
    this.rxStompService.watch('/topic/deleteTrainerPricing').subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      this.handleDeleteTrainerPricing(receivedCategories);
    });

    // Subscribe to individual admin topics
    const currentUserEmail = this.authService.getCurrentUserEmail();
    console.log("current email", currentUserEmail)
    this.rxStompService.watch(`/user/${currentUserEmail}/deleteTrainerPricing`).subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      this.handleDeleteTrainerPricing(receivedCategories);
    });
  }

  handleDeleteTrainerPricing(deletedTrainerPricing: TrainerPricing) {
    // Handle common delete message for all admins
    this.trainerPricingData = this.trainerPricingData.filter(trainerPricing => trainerPricing.id !== deletedTrainerPricing.id);
    this.totalTrainerPricing = this.trainerPricingData.length;
  }


  watchGetTrainerPricingFromMap() {
    this.rxStompService.watch('/topic/getTrainerPricingFromMap').subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      this.trainerPricingData.push(receivedCategories);
      this.totalTrainerPricing = this.trainerPricingData.length
    });
  }
}

