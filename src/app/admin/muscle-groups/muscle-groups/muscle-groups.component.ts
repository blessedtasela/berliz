import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { loadMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
  selector: 'app-muscle-groups',
  templateUrl: './muscle-groups.component.html',
  styleUrls: ['./muscle-groups.component.css']
})
export class MuscleGroupsComponent {
  muscleGroupsData: MuscleGroups[] = [];
  totalMuscleGroups: number = 0;
  muscleGroupsLength: number = 0;
  searchComponent: string = 'muscleGroup'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  readonly selectMuscleGroups = selectMuscleGroups;
  readonly muscleGroupSearchFields: AdminSearchField<MuscleGroups>[] = [
    { value: 'name', label: 'Name', accessor: m => m.name },
    { value: 'bodyPart', label: 'Body part', accessor: m => m.bodyPart },
    { value: 'description', label: 'Description', accessor: m => m.description },
    { value: 'id', label: 'Muscle group id', accessor: m => m.id?.toString() },
    { value: 'status', label: 'Status', accessor: m => m.status },
  ];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
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
        this.totalMuscleGroups = allMuscleGroups.length
        this.muscleGroupsLength = allMuscleGroups.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: MuscleGroups[]): void {
    this.muscleGroupsData = results;
    this.totalMuscleGroups = results.length;
  }

}
