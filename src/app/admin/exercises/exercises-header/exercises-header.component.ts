import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { ExerciseStateService } from 'src/app/services/exercise-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddMuscleGroupModalComponent } from '../../muscle-groups/add-muscle-group-modal/add-muscle-group-modal.component';
import { Exercises } from 'src/app/models/exercise.interface';
import { AddExercisesModalComponent } from '../add-exercises-modal/add-exercises-modal.component';

@Component({
  selector: 'app-exercises-header',
  templateUrl: './exercises-header.component.html',
  styleUrls: ['./exercises-header.component.css']
})
export class ExercisesHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() exercisesData: Exercises[] = [];
  @Input() totalExercises: number = 0;
  @Input() exercisesLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private exerciseStateService: ExerciseStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteExercise()
    this.watchGetExerciseFromMap()
  }

  handleEmitEvent() {
    this.exerciseStateService.getExercises().subscribe((allExercises) => {
      this.ngxService.start()
      console.log('cached false')
      this.exercisesData = allExercises;
      this.totalExercises = this.exercisesData.length
      this.exercisesLength = this.exercisesData.length
      this.exerciseStateService.setAllExercisesSubject(this.exercisesData);
      this.ngxService.stop()
    });
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.exercisesData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'name':
        this.exercisesData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'id':
        this.exercisesData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'exercise':
        this.exercisesData.sort((a, b) => {
          const nameA = a.muscleGroups[0].name.toLowerCase();
          const nameB = b.muscleGroups[0].name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      case 'category':
        this.exercisesData.sort((a, b) => {
          const nameA = a.categories[0].name.toLowerCase();
          const nameB = b.categories[0].name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      case 'lastUpdate':
        this.exercisesData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortCategoriesData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddExercise() {
    const dialogRef = this.dialog.open(AddExercisesModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddExercisesModalComponent;
    childComponentInstance.onAddExerciseEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a exercise');
      }
    });
  }

  watchDeleteExercise() {
    this.rxStompService.watch('/topic/deleteExercise').subscribe((message) => {
      const receivedExercises: Exercises = JSON.parse(message.body);
      this.exercisesData = this.exercisesData.filter(exercise => exercise.id !== receivedExercises.id);
      this.exercisesLength = this.exercisesData.length;
      this.totalExercises = this.exercisesData.length
    });
  }

  watchGetExerciseFromMap() {
    this.rxStompService.watch('/topic/getExerciseFromMap').subscribe((message) => {
      const receivedExercises: Exercises = JSON.parse(message.body);
      this.exercisesData.push(receivedExercises);
      this.exercisesLength = this.exercisesData.length;
      this.totalExercises = this.exercisesData.length
    });
  }
}


