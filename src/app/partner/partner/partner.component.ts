
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partner } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { CenterStateService } from 'src/app/services/center-state.service';
import { FallbackService } from 'src/app/services/fall-back.service';
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
  partner!: Partner;
  user!: Users;

  subscriptions: Subscription[] = [];

  dataReady = false;
  totalRequests = 0;
  completedRequests = 0;

  constructor(
    private userStateService: UserStateService,
    private partnerStateService: PartnerStateService,
    private centerStateService: CenterStateService,
    private trainerStateService: TrainerStateService,
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
  // MARK REQUEST COMPLETE
  // ───────────────────────────────────────────────────────────────
  private markRequestCompleted() {
    this.completedRequests++;

    if (this.completedRequests >= this.totalRequests) {
      this.fallback.done();
    }
  }

  // ───────────────────────────────────────────────────────────────
  // LOADERS
  // ───────────────────────────────────────────────────────────────

  private loadUser(): void {
    this.userStateService.getUser().subscribe({
      next: res => { this.user = res; this.markRequestCompleted(); },
      error: () => this.markRequestCompleted()
    });
  }

  private loadPartner(): void {
    this.partnerStateService.getPartner().subscribe({
      next: res => { this.partner = res; this.markRequestCompleted(); },
      error: () => this.markRequestCompleted()
    });
  }

  private loadCenter(): void {
    this.centerStateService.getCenter().subscribe({
      next: res => { this.center = res; this.markRequestCompleted(); },
      error: () => this.markRequestCompleted()
    });
  }

  private loadTrainer(): void {
    this.trainerStateService.getTrainer().subscribe({
      next: res => { this.trainer = res; this.markRequestCompleted(); },
      error: () => this.markRequestCompleted()
    });
  }

  // ───────────────────────────────────────────────────────────────
  // LOAD DATA (MAIN)
  // ───────────────────────────────────────────────────────────────

  loadData() {
    this.fallback.start();
    this.dataReady = false;
    this.completedRequests = 0;

    const isCenter = this.authService.isCenter();
    const isTrainer = this.authService.isTrainer();

    this.totalRequests = isCenter ? 3 : isTrainer ? 3 : 2;

    this.loadUser();
    this.loadPartner();

    if (isCenter) this.loadCenter();
    if (isTrainer) this.loadTrainer();
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
