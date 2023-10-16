import { DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CenterLike, Centers } from 'src/app/models/centers.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { CenterService } from 'src/app/services/center.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-search-result',
  templateUrl: './center-search-result.component.html',
  styleUrls: ['./center-search-result.component.css']
})
export class CenterSearchResultComponent {
  @Input() centersResult: Centers[] = [];
  showFullData: boolean = false;
  user!: Users;
  responseMessage: any;
  centerLikes: CenterLike[] = [];
  subscriptions: Subscription[] = []
  @Input() totalCenters: number = 0;

  constructor(private datePipe: DatePipe,
    private userStateService: UserStateService,
    private centerStateService: CenterStateService,
    private centerService: CenterService) { }

  ngOnInit(): void {
    this.centerStateService.likeCentersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.centerLikes = cachedData;
      }
    });
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
      this.userStateService.setUserSubject(user);
    })
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.forEach((sub => sub.unsubscribe()))
    }
  }

  handleEmitEvent() {
    this.subscriptions.push(
    this.centerStateService.getActiveCenters().subscribe((activeCenters) => {
      this.centersResult = activeCenters;
      this.totalCenters = this.centersResult.length;
      this.centerStateService.setActiveCentersSubject(this.centersResult);
    }),
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
      this.userStateService.setUserSubject(user);
    }),
    this.centerStateService.getCenterLikes().subscribe((likes) => {
      this.centerLikes = likes
      this.centerStateService.setLikeCentersSubject(this.centerLikes);
    }),
    )
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

  likeCenter(center: Centers) {
    this.centerService.likeCenter(center.id).subscribe(
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

  openUrl(url: any) {
    window.open(url, '_blank');
  }
  
  isLikedCenter(center: Centers): boolean {
    return this.centerLikes.some((centerLikes) =>
      centerLikes.user.id === this.user?.id && centerLikes.center.id === center.id
    );
  }

}