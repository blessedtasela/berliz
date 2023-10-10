import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Trainers } from 'src/app/models/trainers.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { AddTrainerComponent } from '../add-trainer/add-trainer.component';

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
    public trainerStateService: TrainerStateService) {
  }

  ngOnInit() {

  }

  handleEmitEvent() {
    this.trainerStateService.getAllTrainers().subscribe((allTrainers) => {
      this.ngxService.start()
      this.trainersData = allTrainers;
      this.totalTrainers = this.trainersData.length
      this.trainersLength = this.trainersData.length
      this.trainerStateService.setAllTrainersSubject(this.trainersData);
      this.ngxService.stop()
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
      case 'id':
        this.trainersData.sort((a, b) => {
          return a.id - b.id;
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

}
