import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddMuscleGroupModalComponent } from '../add-muscle-group-modal/add-muscle-group-modal.component';
import { loadMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';

@Component({
  selector: 'app-muscle-groups-header',
  templateUrl: './muscle-groups-header.component.html',
  styleUrls: ['./muscle-groups-header.component.css']
})
export class MuscleGroupsHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() muscleGroupsData: MuscleGroups[] = [];
  @Input() totalMuscleGroups: number = 0;
  @Input() muscleGroupsLength: number = 0;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteMuscleGroup()
    this.watchGetMuscleGroupFromMap()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadMuscleGroups());
    this.subscriptions.push(
      this.store.select(selectMuscleGroups).subscribe((allMuscleGroups) => {
        this.muscleGroupsData = allMuscleGroups;
        this.totalMuscleGroups = this.muscleGroupsData.length
        this.muscleGroupsLength = this.muscleGroupsData.length
        this.ngxService.stop()
      })
    );
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.muscleGroupsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'name':
        this.muscleGroupsData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
        case 'bodyPart':
        this.muscleGroupsData.sort((a, b) => {
          return a.bodyPart.localeCompare(b.bodyPart);
        });
        break;
      case 'id':
        this.muscleGroupsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.muscleGroupsData.sort((a, b) => {
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

  openAddMuscleGroup() {
    const dialogRef = this.dialog.open(AddMuscleGroupModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddMuscleGroupModalComponent;
    childComponentInstance.onAddMuscleGroupEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a muscleGroup');
      }
    });
  }

  watchDeleteMuscleGroup() {
    this.rxStompService.watch('/topic/deleteMuscleGroup').subscribe((message) => {
      const receivedCategories: MuscleGroups = JSON.parse(message.body);
      this.muscleGroupsData = this.muscleGroupsData.filter(muscleGroup => muscleGroup.id !== receivedCategories.id);
      this.muscleGroupsLength = this.muscleGroupsData.length;
      this.totalMuscleGroups = this.muscleGroupsData.length
    });
  }

  watchGetMuscleGroupFromMap() {
    this.rxStompService.watch('/topic/getMuscleGroupFromMap').subscribe((message) => {
      const receivedCategories: MuscleGroups = JSON.parse(message.body);
      this.muscleGroupsData.push(receivedCategories);
      this.muscleGroupsLength = this.muscleGroupsData.length;
      this.totalMuscleGroups = this.muscleGroupsData.length
    });
  }
}

