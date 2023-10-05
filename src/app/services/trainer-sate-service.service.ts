import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SnackBarService } from './snack-bar.service';
import { TrainerService } from './trainer.service';

@Injectable({
  providedIn: 'root'
})
export class TrainerSateServiceService {
  private dataSubject = new BehaviorSubject<any>(null);
  public data$: Observable<any> = this.dataSubject.asObservable();

  constructor(private trainerService: TrainerService,
    private snackbarService: SnackBarService) {}

  setData(data: any) {
    this.dataSubject.next(data);
  }


}
