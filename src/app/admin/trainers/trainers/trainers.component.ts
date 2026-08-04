import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { loadTrainers } from 'src/app/state/trainer/trainer.actions';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css']
})
export class TrainersComponent {
  trainersData: Trainers[] = [];
  totalTrainers: number = 0;
  trainersLength: number = 0;
  searchComponent: string = 'trainer'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    public store: Store,) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadTrainers());
    this.subscriptions.push(
      this.store.select(selectTrainers).subscribe((allTrainers) => {
        this.trainersData = allTrainers;
        this.totalTrainers = allTrainers.length
        this.trainersLength = allTrainers.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Trainers[]): void {
    this.trainersData = results;
    this.totalTrainers = results.length;
  }

}


