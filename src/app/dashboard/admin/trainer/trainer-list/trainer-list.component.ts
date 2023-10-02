import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { ViewCertificateModalComponent } from 'src/app/shared/view-certificate-modal/view-certificate-modal.component';
import { ViewCvModalComponent } from 'src/app/shared/view-cv-modal/view-cv-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { AddPartnerModalComponent } from '../../partners/add-partner-modal/add-partner-modal.component';
import { PartnerDetailsComponent } from '../../partners/partner-details/partner-details.component';
import { UpdatePartnerModalComponent } from '../../partners/update-partner-modal/update-partner-modal.component';
import { TrainerService } from 'src/app/services/trainer.service';
import { TrainerDataService } from 'src/app/services/trainer-data.service';
import { TrainerDetailsComponent } from '../trainer-details/trainer-details.component';
import { TrainerFormModalComponent } from 'src/app/shared/trainer-form-modal/trainer-form-modal.component';
import { UpdateTrainerModalComponent } from 'src/app/shared/update-trainer-modal/update-trainer-modal.component';
import { AddTrainerComponent } from '../add-trainer/add-trainer.component';
import { UpdateTrainerPhotoModalComponent } from 'src/app/shared/update-trainer-photo-modal/update-trainer-photo-modal.component';

@Component({
  selector: 'app-trainer-list',
  templateUrl: './trainer-list.component.html',
  styleUrls: ['./trainer-list.component.css']
})
export class TrainerListComponent {
  trainersData: Trainers[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredTrainersData: Trainers[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalTrainers: number = 0;
  results: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()

  constructor(private trainerService: TrainerService,
    private trainerDataService: TrainerDataService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.trainerDataService.getAllTrainers().subscribe(() => {
      this.ngxService.start();
      this.initializeSearch();
      this.trainersData = this.trainerDataService.trainersData;
      this.filteredTrainersData = this.trainersData
      this.counter = this.filteredTrainersData.length
      this.totalTrainers = this.trainersData.length;
      this.trainerService.trainerEventEmitter;
      this.sortTrainersData();
      this.ngxService.stop();
    });
  }


  initializeSearch(): void {
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
        (results: Trainers[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  sortTrainersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredTrainersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'motto':
        this.filteredTrainersData.sort((a, b) => {
          return a.motto.localeCompare(b.motto);
        });
        break;

      case 'id':
        this.filteredTrainersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      case 'likes':
        this.filteredTrainersData.sort((a, b) => {
          return a.likes - b.likes;
        });
        break;

      default:
        this.filteredTrainersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
    }
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortTrainersData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Trainers[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredTrainersData = this.trainersData;
      this.counter = this.filteredTrainersData.length;
      return of(this.filteredTrainersData);
    }
    this.filteredTrainersData = this.trainersData.filter((trainer: Trainers) => {
      switch (this.selectedSearchCriteria) {
        case 'motto':
          return trainer.motto.toLowerCase().includes(query);
        case 'id':
          return trainer.id.toString().includes(query);
        case 'email':
          return trainer.partner.user.email.toLowerCase().includes(query);
        case 'status':
          return trainer.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredTrainersData.length;
    return of(this.filteredTrainersData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddTrainer() {
    const dialogRef = this.dialog.open(AddTrainerComponent, {
      width: '800px',
      height: '600px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddTrainerComponent;

    // Set the event emitter before closing the dialog
    childComponentInstance.onAddTrainerEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without performing any action');
      }
    });
  }

  openUpdateTrainer(id: number) {
    try {
      const trainer = this.trainersData.find(partner => partner.id === id);
      if (trainer) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.width = '800px',
          dialogConfig.height = '600px',
          dialogConfig.data = { trainerData: trainer }
        const dialogRef = this.dialog.open(UpdateTrainerModalComponent, dialogConfig);
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdateTrainerEmit.subscribe(() => {
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
        this.snackbarService.openSnackBar('partner not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check partner status", 'error');
    }
  }


  updateTrainerStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const trainer = this.trainersData.find(trainer => trainer.id === id);
    const message = trainer?.status === 'false'
      ? 'activate this trainer\'s as account?'
      : 'deactivate this trainer\'s account?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.trainerService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Trainer status updated successfully');
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

  openTrainerDetails(id: number) {
    const trainer = this.trainersData.find(partner => partner.id === id);
    if (trainer) {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;
      dialogConfig.width = '800px',
        dialogConfig.height = '600px',
        dialogConfig.data = { trainerData: trainer }
      const dialogRef = this.dialog.open(TrainerDetailsComponent, dialogConfig);
      const childComponentInstance = dialogRef.componentInstance as TrainerDetailsComponent;
      const sub = dialogRef.componentInstance.onEmit.subscribe((res: any) => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  deletePartner(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this trainer? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.trainerService.deleteTrainer(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Trainer deleted successfully');
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

  openUpdatePhoto(id: number) {
    try {
      const trainer = this.trainersData.find(trainer => trainer.id === id);
      if (trainer) {
        const dialogRef = this.dialog.open(UpdateTrainerPhotoModalComponent, {
          width: '600px',
          data: {
            trainerData: trainer,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTrainerPhotoModalComponent;

        // Set the event emitter before closing the dialog
        childComponentInstance.onUpdatePhotoEmit.subscribe(() => {
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating trainer photo');
          }
        });
      }
      else {
        this.snackbarService.openSnackBar('trainer not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check trainer status", 'error');
    }
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}

