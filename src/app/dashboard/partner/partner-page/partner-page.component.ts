import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-partner-page',
  templateUrl: './partner-page.component.html',
  styleUrls: ['./partner-page.component.css']
})
export class PartnerPageComponent {
  center!: Centers;
  trainer!: Trainers;
  partner!: Partners;
  user!: Users;

  private subscriptions: Subscription[] = []

  constructor(private userStateService: UserStateService,
    private partnerStateService: PartnerStateService,
    private centerStateService: CenterStateService,
    private trainerStateService: TrainerStateService,
    private ngxService: NgxUiLoaderService) { }

  ngOnInit() {
    this.subscriptions.push(
      this.userStateService.userData$.subscribe((cachedUser) => {
        this.user = cachedUser;
      }),
      this.centerStateService.centerData$.subscribe((cachedCenter) => {
        this.center = cachedCenter;
      }),
      this.trainerStateService.trainerData$.subscribe((cachedTrainer) => {
        this.trainer = cachedTrainer;
      }),
      this.partnerStateService.partnerData$.subscribe((cachedPartner) => {
        this.partner = cachedPartner;
      })
    );

    if (!this.user || !this.center || !this.trainer || !this.partner) {
      this.handleEmitEvent();
    }
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start();
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
    this.ngxService.stop();
  }

  emitData(): void {
    this.handleEmitEvent()
  }

  
}
