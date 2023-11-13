import { DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CenterLike, Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { CenterService } from 'src/app/services/center.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
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
    private centerService: CenterService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchLikeCenter()
    this.watchUpdatePhoto()
    this.watchUpdateCenterStatus()
    this.watchUpdateCenter()
    this.centerStateService.likeCentersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.centerLikes = cachedData;
      }
    });
    this.subscribeUser()
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.forEach((sub => sub.unsubscribe()))
    }
  }

  subscribeUser() {
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
      this.userStateService.setUserSubject(user);
    })
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

  watchLikeCenter() {
    this.rxStompService.watch('/topic/likeCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centersResult.findIndex(center => center.id === receivedCenter.id)
      this.centersResult[centerId] = receivedCenter
    });
  }

  watchUpdateCenter() {
    this.rxStompService.watch('/topic/updateCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centersResult.findIndex(center => center.id === receivedCenter.id)
      this.centersResult[centerId] = receivedCenter
    });
  }

  watchUpdateCenterStatus() {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      if (receivedCenter.status === 'true') {
        this.centersResult.push(receivedCenter);
      } else {
        this.centersResult = this.centersResult.filter(center => center.id !== receivedCenter.id);
      }
    });
  }

  watchUpdatePhoto() {
    this.rxStompService.watch('/topic/updateCenterPhoto').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      const centerId = this.centersResult.findIndex(center => center.id === receivedCenter.id)
      this.centersResult[centerId] = receivedCenter
    });
  }

}