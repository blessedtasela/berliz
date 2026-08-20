
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, combineLatest } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { FallbackService } from 'src/app/services/fall-back.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectCurrentCenter, selectCenterLoading } from 'src/app/state/center/center.selectors';
import { loadCenter } from 'src/app/state/center/center.actions';
import { selectCurrentTrainer, selectTrainerLoading } from 'src/app/state/trainer/trainer.selector';
import { loadMyTrainer } from 'src/app/state/trainer/trainer.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner, selectPartnerLoading } from 'src/app/state/partner/partner.selectors';

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
    // Dispatch first so the loading flags below flip to `true` synchronously
    // (NgRx reducers run synchronously) before we read their initial value.
    this.loadData();
    this.watchStoreState();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  emitData() {
    this.loadData();
  }

  // ───────────────────────────────────────────────────────────────
  // STORE SUBSCRIPTIONS
  // ───────────────────────────────────────────────────────────────
  // Set up exactly once (here, from ngOnInit) instead of inside loadData().
  // Previously each of user/partner/center/trainer was (re)subscribed to on
  // every single loadData() call — including every one of the ~17 websocket
  // topic callbacks in setupWatchEvents() — which leaked a growing number of
  // live, never-unsubscribed store subscriptions for the life of the page.

  private watchStoreState(): void {
    this.subscriptions.push(
      this.store.select(selectUser).subscribe(user => {
        this.user = user;
      }),
      this.store.select(selectMyPartner).subscribe(res => {
        if (res) this.partner = res;
      }),
      this.store.select(selectCurrentCenter).subscribe(res => {
        this.center = res;
      }),
      this.store.select(selectCurrentTrainer).subscribe(res => {
        this.trainer = res;
      }),
      // `dataReady` only flips to true once every in-flight load this
      // component triggered has actually resolved (success or failure) —
      // not immediately after the dispatches were fired off. Previously
      // `dataReady = true` was set synchronously right after dispatch,
      // so the real-content template briefly rendered with stale/default
      // store values (e.g. flashing "no partner" before the partner had
      // actually loaded).
      combineLatest([
        this.store.select(selectPartnerLoading),
        this.store.select(selectCenterLoading),
        this.store.select(selectTrainerLoading),
      ]).subscribe(([partnerLoading, centerLoading, trainerLoading]) => {
        if (!partnerLoading && !centerLoading && !trainerLoading) {
          this.dataReady = true;
        }
      }),
    );
  }

  // ───────────────────────────────────────────────────────────────
  // LOAD DATA (MAIN)
  // ───────────────────────────────────────────────────────────────
  // Only dispatches — safe to call as many times as needed (initial load,
  // websocket-triggered refresh, child "onEmit" events) without piling up
  // new subscriptions. The loadCenter$ / loadMyPartner$ / loadMyTrainer$
  // effects use exhaustMap so concurrent/duplicate dispatches of the same
  // action collapse into a single in-flight HTTP request instead of firing
  // a new GET for every dispatch (this is what caused GET /center/getCenter
  // to fire multiple times for what should have been one load).

  loadData() {
    this.store.dispatch(loadMyPartner());
    this.store.dispatch(loadCenter());
    this.store.dispatch(loadMyTrainer());
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
