import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { AddTrainerModalComponent } from '../add-trainer-modal/add-trainer-modal.component';
import { Store } from '@ngrx/store';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-trainer-header',
  templateUrl: './trainer-header.component.html',
  styleUrls: ['./trainer-header.component.css']
})
export class TrainerHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() trainersData: Trainers[] = [];
  @Input() totalTrainers: number = 0;
  @Input() trainersLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    public store: Store) {
  }

  ngOnInit() {

  }

  handleEmitEvent() {
    this.store.select(selectTrainers).subscribe((allTrainers) => {
      this.trainersData = allTrainers;
      this.totalTrainers = this.trainersData.length
      this.trainersLength = this.trainersData.length
    });
  }

  sortTrainersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.trainersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'motto':
        this.trainersData.sort((a, b) => {
          return a.motto.localeCompare(b.motto);
        });
        break;
      case 'name':
        this.trainersData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'id':
        this.trainersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'address':
        this.trainersData.sort((a, b) => {
          return a.address.localeCompare(b.address);
        });
        break;
      case 'partnerId':
        this.trainersData.sort((a, b) => {
          return a.partnerId - b.partnerId;
        });
        break;
      case 'likes':
        this.trainersData.sort((a, b) => {
          return b.likes - a.likes;
        });
        break;
      default:
        this.trainersData.sort((a, b) => {
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

  openAddTrainer() {
    const dialogRef = this.dialog.open(AddTrainerModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    const childComponentInstance = dialogRef.componentInstance as AddTrainerModalComponent;

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

}
