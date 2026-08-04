
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { FallbackService } from 'src/app/services/fall-back.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectCurrentCenter } from 'src/app/state/center/center.selectors';
import { loadCenter } from 'src/app/state/center/center.actions';
import { selectCurrentTrainer } from 'src/app/state/trainer/trainer.selector';
import { loadMyTrainer } from 'src/app/state/trainer/trainer.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent implements OnInit, OnDestroy {

  center!: Centers | null;
  trainer: Trainers | null = null;
  partner!: Partner;
  user: Users | null = null;

  dataReady = false;
  totalRequests = 0;
  completedRequests = 0;
  subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private rxStompService: RxStompService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    public fallback: FallbackService,
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


  // ───────────────────────────────────────────────────────────────
  // LOADERS
  // ───────────────────────────────────────────────────────────────

  private loadUser(): void {
    this.store.select(selectUser).subscribe(user => {
      this.user = user
    })
  }

  private loadPartner(): void {
    this.store.dispatch(loadMyPartner());
    this.store.select(selectMyPartner).subscribe(res => {
      if (res) this.partner = res;
    });
  }


  private loadCenter(): void {
    this.store.dispatch(loadCenter());
    this.store.select(selectCurrentCenter).subscribe(res => {
      this.center = res;
    });
  }

  private loadTrainer(): void {
    this.store.dispatch(loadMyTrainer());
    this.store.select(selectCurrentTrainer).subscribe(res => {
      this.trainer = res;
    });
  }

  // ───────────────────────────────────────────────────────────────
  // LOAD DATA (MAIN)
  // ───────────────────────────────────────────────────────────────

  loadData() {
    this.loadUser();
    this.loadPartner();
    this.loadCenter();
    this.loadTrainer();
    this.dataReady = true;
  }



  // ───────────────────────────────────────────────────────────────
  // WATCH EVENTS
  // ───────────────────────────────────────────────────────────────

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
