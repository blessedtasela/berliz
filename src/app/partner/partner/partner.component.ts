import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, forkJoin, of } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
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
export class PartnerComponent implements OnInit {
  center!: Centers;
  trainer!: Trainers;
  partner!: Partners;
  user!: Users;
  subscriptions: Subscription[] = [];
  componentLoaded: boolean = false;
  partnerLoaded: boolean = false;
  centerLoaded: boolean = false;
  trainerLoaded: boolean = false;
  userLoaded: boolean = false;


  constructor(
    private userStateService: UserStateService,
    private partnerStateService: PartnerStateService,
    private centerStateService: CenterStateService,
    private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService,
    private rxStompService: RxStompService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    this.ngxService.start();
    this.handleWatchEvents();
    this.loadData();
    console.log("in onInit")
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    console.log('Starting handleEmitEvent');
    this.userStateService.getUser().subscribe((user) => {
      this.user = user;
      this.userStateService.setUserSubject(user);
    })
    this.partnerStateService.getPartner().subscribe((partner) => {
      this.partner = partner;
      this.partnerStateService.setPartnerSubject(partner);
    })
    if (this.authService.isCenter()) {
      this.centerStateService.getCenter().subscribe((center) => {
        this.center = center;
        this.centerStateService.setCenterSubject(center);
      })
    } else if (this.authService.isTrainer()) {
      this.trainerStateService.getTrainer().subscribe((trainer) => {
        this.trainer = trainer;
        this.trainerStateService.setTrainerSubject(trainer);
      })
    }

    this.componentLoaded = true;
    console.log(this.partner)

  }

  loadData() {
    if (this.authService.isCenter()) {
      forkJoin({
        user: this.userStateService.getUser(),
        partner: this.partnerStateService.getPartner(),
        center: this.centerStateService.getCenter(),
      }).subscribe(
        ({ user, partner, center }) => {
          this.user = user;
          this.partner = partner;
          this.center = center;
          this.componentLoaded = true;
          this.ngxService.stop();
        }, error => {
          console.log('Error loading data: ', error);
          this.ngxService.stop();
        })
    } else if (this.authService.isTrainer()) {
      forkJoin({
        user: this.userStateService.getUser(),
        partner: this.partnerStateService.getPartner(),
        trainer: this.trainerStateService.getTrainer(),
      }).subscribe(
        ({ user, partner, trainer }) => {
          this.user = user;
          this.partner = partner;
          this.trainer = trainer;
          this.componentLoaded = true;
          this.ngxService.stop();
        }, error => {
          console.log('Error loading data: ', error);
          this.ngxService.stop();
        })
    }
  }

  emitData(): void {
    this.handleEmitEvent();
  }


  handleWatchEvents() {
    this.watchDeletePartner();
    this.watchGetPartnerFromMap();
    this.watchRejectPartnerApplication();
    this.watchUpdatePartner();
    this.watchUpdatePartnerStatus();
    this.watchUpdateProfilePhoto();
    this.watchUpdateUser();
  }

  watchGetPartnerFromMap() {
    this.rxStompService.watch('/topic/getPartnerFromMap').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchDeletePartner() {
    this.rxStompService.watch('/topic/deletePartner').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdatePartnerStatus() {
    this.rxStompService.watch('/topic/updatePartnerStatus').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdatePartner() {
    this.rxStompService.watch('/topic/updatePartner').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchRejectPartnerApplication() {
    this.rxStompService.watch('/topic/rejectPartnerApplication').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}

