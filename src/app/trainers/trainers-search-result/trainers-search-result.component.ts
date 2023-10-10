import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerLike, Users } from 'src/app/models/users.interface';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-trainers-search-result',
  templateUrl: './trainers-search-result.component.html',
  styleUrls: ['./trainers-search-result.component.css']
})
export class TrainersSearchResultComponent implements OnInit {
  @Input() trainersResult: Trainers[] = [];
  showFullData: boolean = false;
  @Input() totalTrainers: number = 0;
  user!: Users;
  responseMessage: any;
  trainerlikes: TrainerLike[] = [];

  constructor(private datePipe: DatePipe,
    private userStateService: UserStateService,
    private trainerStateService: TrainerStateService,
    private trainerService: TrainerService) { }

  ngOnInit(): void {
    this.trainerStateService.likeTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleTrainerLikeEmit()
      } else {
        this.trainerlikes = cachedData;
      }
    });
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.trainerStateService.getActiveTrainers().subscribe((activeTrainers) => {
      this.trainersResult = activeTrainers;
      this.trainerStateService.setActiveTrainersSubject(this.trainersResult);
    });
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
    })
    this.handleTrainerLikeEmit()
  }

  handleTrainerLikeEmit() {
    this.trainerStateService.getTrainerLikes().subscribe((likes) => {
      this.trainerlikes = likes
      this.trainerStateService.setLikeTrainersSubject(this.trainerlikes);
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatStringtoUrl(string: any) {
    return string.replace(/ /g, "-");
  }

  likeTrainer(trainer: Trainers) {
    this.trainerService.likeTrainer(trainer.id).subscribe(
      (response: any) => {
        this.responseMessage = response.message;
        this.handleEmitEvent()
        console.log('message', this.responseMessage);
      },
      (error: any) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        console.log('error message', this.responseMessage);
        window.alert('please login to continue')
      }
    );
  }

  isLikedTrainer(trainer: Trainers): boolean {
    return this.trainerlikes.some((trainerLike) =>
      trainerLike.user.id === this.user?.id && trainerLike.trainer.id === trainer.id
    );
  }

}