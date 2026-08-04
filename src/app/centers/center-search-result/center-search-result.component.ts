import { DatePipe } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CenterLikes, Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterService } from 'src/app/services/center.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectCenterLikes, selectCenters } from 'src/app/state/center/center.selectors';
import { selectUser, selectUsers } from 'src/app/state/user/user.selector';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-center-search-result',
  templateUrl: './center-search-result.component.html',
  styleUrls: ['./center-search-result.component.css']
})
export class CenterSearchResultComponent {
  @Input() centersResult: Centers[] = [];
  showFullData: boolean = false;
  user!: Users | null;
  responseMessage: any;
  centerLikes: CenterLikes[] = [];
  subscriptions: Subscription[] = []
  @Input() totalCenters: number = 0;
  visibleCenters: number = 12;

  constructor(private datePipe: DatePipe,
    private store: Store,
    private centerService: CenterService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchLikeCenter()
    this.watchUpdatePhoto()
    this.watchUpdateCenterStatus()
    this.watchUpdateCenter()
    this.store.select(selectCenterLikes).subscribe((cachedData) => {
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
    this.store.select(selectUser).subscribe((user) => {
      this.user = user;
    })
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.store.select(selectCenters).subscribe((activeCenters) => {
        this.centersResult = activeCenters;
        this.totalCenters = this.centersResult.length;
      }),
      this.store.select(selectUser).subscribe((user) => {
        this.user = user;
      }),
      this.store.select(selectCenterLikes).subscribe((likes) => {
        this.centerLikes = likes
      }),
    )
  }

  toggleCenterData(): void {
    this.showFullData = !this.showFullData;
    this.visibleCenters = this.showFullData ? this.centersResult.length : 12;
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
      centerLikes.userId === this.user?.id && centerLikes.centerId === center.id
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