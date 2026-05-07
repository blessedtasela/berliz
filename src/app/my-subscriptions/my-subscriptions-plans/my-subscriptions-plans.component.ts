import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-my-subscriptions-plans',
  templateUrl: './my-subscriptions-plans.component.html',
  styleUrls: ['./my-subscriptions-plans.component.css']
})
export class MySubscriptionsPlansComponent {

  @Input() plans: any;

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans() {
    this.plans = [
      {
        name: 'Basic',
        description: 'Perfect for starting your Berliz journey.',
        details: [
          'Access to certified trainers',
          'Entry to select gym centers'
        ],
        duration: '1 month',
        discount: '10'
      },
      {
        name: 'Plus',
        description: 'Level up your fitness with personalized coaching.',
        details: [
          'Personalized coaching sessions',
          'Access to premium gym centers'
        ],
        duration: '3 months',
        discount: '15'
      },
      {
        name: 'Pro',
        description: 'Maximize your potential with elite training.',
        details: [
          'One-on-one elite trainer sessions',
          'Access to top-tier facilities'
        ],
        duration: '6 months',
        discount: '20'
      },
      {
        name: 'Exclusive',
        description: 'For those who want the absolute best.',
        details: [
          'VIP training sessions',
          'Unlimited access to luxury gym centers'
        ],
        duration: '9–12 months',
        discount: '50'
      }
    ];
  }

}
