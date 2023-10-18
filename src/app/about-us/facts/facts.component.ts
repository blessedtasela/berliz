import { Component } from '@angular/core';
import { Facts } from 'src/app/models/facts.model';
import { statistics } from 'src/app/models/landing.model';
import { DashboardService } from 'src/app/services/dashboard.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.css']
})
export class FactsComponent {
  animationState = 'start';
  stats: statistics[] = [];
  partnerValue: any;
  memberValue: any;
  centerValue: any
  categoryValue: any;
  responseMessage: any;

  constructor(private dashboardService: DashboardService) {

  }

  ngOnInit() {
    this.getBerlizDetails();
    this.stats = [
      { id: 1, name: "Our Partners", iconUrl: "../../../assets/icons/group.png", value: 65, counterValue: 0 },
      { id: 2, name: "Our Centers", iconUrl: "../../../assets/icons/gym.png", value: 23, counterValue: 0 },
      { id: 3, name: "Our Members", iconUrl: "../../../assets/icons/networking.png", value: 400, counterValue: 0 },
      { id: 4, name: "Categories", iconUrl: "../../../assets/icons/wrestling.png", value: 400, counterValue: 0 },
    ]

  }

  animateCounter() {
    this.stats.forEach((stat) => {
      const targetValue = stat.value;
      const interval = setInterval(() => {
        stat.counterValue++;
        if (stat.counterValue >= targetValue) {
          clearInterval(interval);
        }
      }, 1000 / targetValue);
    });
  }


  getBerlizDetails() {
    this.dashboardService.getBerlizDetails()
      .subscribe((response: any) => {
        this.centerValue = response.centers;
        this.partnerValue = response.partners;
        this.memberValue = response.users;
        this.categoryValue = response.categories;

        const partners = this.stats.find(stat => stat.id === 1);
        if (partners) {
          partners.value = this.partnerValue;
        }
        const centers = this.stats.find(stat => stat.id === 2);
        if (centers) {
          centers.value = this.centerValue;
        }
          const members = this.stats.find(stat => stat.id === 3);
        if (members) {
          members.value = this.memberValue;
        }

        const categories = this.stats.find(stat => stat.id === 4);
        if (categories) {
          categories.value = this.categoryValue;
        }

        this.animateCounter();
      }, (error) => {
        console.log(error)
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
      })
  }

}
