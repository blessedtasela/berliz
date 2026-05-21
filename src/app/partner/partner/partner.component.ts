import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { CenterStateService } from 'src/app/services/center-state.service';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit, OnDestroy {

  center!: Centers;
  trainer!: Trainers;
  partner!: Partners;
  user!: Users;

  subscriptions: Subscription[] = [];
  componentLoaded = false;

  constructor(
    private userStateService: UserStateService,
    private partnerStateService: PartnerStateService,
    private centerStateService: CenterStateService,
    private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.setupWatchEvents();
    this.loadData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  emitData() {
    this.loadData();
  }

  loadData() {
    const isCenter = this.authService.isCenter();
    const isTrainer = this.authService.isTrainer();

    type PartnerData =
      | { user: Users; partner: Partners; center: Centers }
      | { user: Users; partner: Partners; trainer: Trainers };

    let request$: Observable<PartnerData>;

    if (isCenter) {
      request$ = forkJoin({
        user: this.userStateService.getUser(),
        partner: this.partnerStateService.getPartner(),
        center: this.centerStateService.getCenter()
      });
    } else if (isTrainer) {
      request$ = forkJoin({
        user: this.userStateService.getUser(),
        partner: this.partnerStateService.getPartner(),
        trainer: this.trainerStateService.getTrainer()
      });
    } else {
      return;
    }

    const sub = request$.subscribe({
      next: (data: any) => {
        this.user = data.user;
        this.partner = data.partner;

        if ('center' in data) this.center = data.center;
        if ('trainer' in data) this.trainer = data.trainer;

        this.componentLoaded = true;
      },
      error: (err: unknown) => {
        console.error('Error loading data:', err);
      }
    });

    this.subscriptions.push(sub);
  }

  setupWatchEvents() {
    const topics = [
      '/topic/getPartnerFromMap',
      '/topic/deletePartner',
      '/topic/updatePartnerStatus',
      '/topic/updatePartner',
      '/topic/rejectPartnerApplication',
      '/topic/updateProfilePhoto',
      '/topic/updateUser',
      '/topic/addTrainer',
      '/topic/updateTrainer',
      '/topic/deleteTrainer',
      '/topic/addCenter',
      '/topic/updateCenter',
      '/topic/deleteCenter',
      '/topic/updateCenterPhoto',
      '/topic/updateTrainerPhoto',
      '/topic/updatePartnerPhoto',
      '/topic/updateCv',
      '/topic/updateCertificate'
    ];

    topics.forEach(topic => {
      const sub = this.rxStompService.watch(topic).subscribe(() => {
        this.loadData();
      });
      this.subscriptions.push(sub);
    });
  }
}