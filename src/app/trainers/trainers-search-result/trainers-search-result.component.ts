import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { Trainers } from 'src/app/models/trainers.interface';
import { TrainerLike, Users } from 'src/app/models/users.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { WebSocketService } from 'src/app/services/web-socket.service';
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
  visibleItems: number = 12;

  constructor(private datePipe: DatePipe,
    private userStateService: UserStateService,
    private trainerStateService: TrainerStateService,
    private trainerService: TrainerService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,) { }

  ngOnInit(): void {
    this.watchLikeTrainer()
    this.watchUpdatePhoto()
    this.watchUpdateTrainerStatus()
    this.watchUpdateTrainer()
    this.trainerStateService.likeTrainersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleTrainerLikeEmit()
      } else {
        this.trainerlikes = cachedData;
      }
    });
    this.userSubscription()
  }

  userSubscription() {
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

  toggleData(): void {
    this.showFullData = !this.showFullData;
    this.visibleItems = this.showFullData ? this.trainersResult.length : 12;
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  formatStringtoUrl(string: any) {
    return string.replace(/ /g, "-");
  }

  updateTrainerLike(trainer: Trainers) {
    this.trainerService.likeTrainer(trainer.id).subscribe(
      (response: any) => {
        this.responseMessage = response.message;
        this.handleEmitEvent()
        this.snackbarService.openSnackBar(this.responseMessage, '');
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

  watchLikeTrainer() {
    this.rxStompService.watch('/topic/likeTrainer').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersResult.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersResult[trainerId] = receivedTrainer
    });
  }

  watchUpdateTrainer() {
    this.rxStompService.watch('/topic/updateTrainer').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersResult.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersResult[trainerId] = receivedTrainer
    });
  }

  watchUpdateTrainerStatus() {
    this.rxStompService.watch('/topic/updateTrainerStatus').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      if (receivedTrainer.status === 'true') {
        this.trainersResult.push(receivedTrainer);
      } else {
        this.trainersResult = this.trainersResult.filter(trainer => trainer.id !== receivedTrainer.id);
      }
    });
  }

  watchUpdatePhoto() {
    this.rxStompService.watch('/topic/updatePhoto').subscribe((message) => {
      const receivedTrainer: Trainers = JSON.parse(message.body);
      const trainerId = this.trainersResult.findIndex(trainer => trainer.id === receivedTrainer.id)
      this.trainersResult[trainerId] = receivedTrainer
    });
  }

}