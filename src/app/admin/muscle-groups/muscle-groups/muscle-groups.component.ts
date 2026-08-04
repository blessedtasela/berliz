import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { loadMuscleGroups } from 'src/app/state/muscle-group/muscle-group.actions';
import { selectMuscleGroups } from 'src/app/state/muscle-group/muscle-group.selectors';

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
