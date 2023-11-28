import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { CategoryStateService } from 'src/app/services/category-state.service';
import { MuscleGroupStateService } from 'src/app/services/muscle-group-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    private muscleGroupStateService: MuscleGroupStateService) {
  }

  ngOnInit(): void {
    this.muscleGroupStateService.allMuscleGroupData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.muscleGroupsData = cachedData;
        this.totalMuscleGroups = cachedData.length
        this.muscleGroupsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.muscleGroupStateService.getMuscleGroups().subscribe((allMuscleGroups) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.muscleGroupsData = allMuscleGroups;
      this.totalMuscleGroups = allMuscleGroups.length
      this.muscleGroupsLength = allMuscleGroups.length
      this.muscleGroupStateService.setAllMuscleGroupsSubject(this.muscleGroupsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: MuscleGroups[]): void {
    this.muscleGroupsData = results;
    this.totalMuscleGroups = results.length;
  }

}

