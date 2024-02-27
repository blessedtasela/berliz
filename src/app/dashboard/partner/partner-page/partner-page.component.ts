import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-partner-page',
  templateUrl: './partner-page.component.html',
  styleUrls: ['./partner-page.component.css']
})
export class PartnerPageComponent implements OnInit{
  center!: Centers;
  trainer!: Trainers;
  partner!: Partners;
  user!: Users;
  subscriptions: Subscription[] = []

  constructor(private userStateService: UserStateService,
    private partnerStateService: PartnerStateService,
    private centerStateService: CenterStateService,
    private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService) { }

  ngOnInit() {
    this.ngxService.start();
    this.handleEmitEvent();
    this.ngxService.stop();
    this.watchDeletePartner()
    this.watchGetPartnerFromMap()
    this.watchRejectPartnerApplication()
    this.watchUpdatePartner()
    this.watchUpdatePartnerStatus()
    this.watchUpdateProfilePhoto()
    this.watchUpdateUser()
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(this.userStateService.getUser().subscribe((user) => {
      this.user = user;
      this.userStateService.setUserSubject(user);
    }),
      this.partnerStateService.getPartner().subscribe((partner) => {
        this.partner = partner;
        this.partnerStateService.setPartnerSubject(partner);
      }),
      this.trainerStateService.getTrainer().subscribe((trainer) => {
        this.trainer = trainer;
        this.trainerStateService.setTrainerSubject(trainer);
      }),
      this.centerStateService.getCenter().subscribe((center) => {
        this.center = center;
        this.centerStateService.setCenterSubject(center);
      })
    );
  }

  emitData(): void {
    this.handleEmitEvent()
  }

  watchGetPartnerFromMap() {
    this.rxStompService.watch('/topic/getPartnerFromMap').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchDeletePartner() {
    this.rxStompService.watch('/topic/deletePartner').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdatePartnerStatus() {
    this.rxStompService.watch('/topic/updatePartnerStatus').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdatePartner() {
    this.rxStompService.watch('/topic/updatePartner').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchRejectPartnerApplication() {
    this.rxStompService.watch('/topic/rejectPartnerApplication').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe((message) => {
      this.handleEmitEvent()
    });
  }
}


