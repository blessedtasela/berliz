import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-subscription-plans',
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css']
})
export class SubscriptionPlansComponent {
@Input() plans: any;

  constructor(){}

  ngOnInit(): void {
    this.createPlan()
  }

  createPlan() {
    this.plans = [
      {
        name: 'Basic',
        description: 'Ideal for users eager to experience Berliz',
        details: [
          'Access to certified trainers for guidance',
          'Entry to select gym centers for exploration'
        ],
        duration: '1 month',
        discount: '10'
      },
      {
        name: 'Plus',
        description: 'For users ready to level up their fitness journey',
        details: [
          'Personalized coaching sessions tailored to your goals',
          'Access to premium gym centers equipped with state-of-the-art facilities'
        ],
        duration: '3 months',
        discount: '15'
      },
      {
        name: 'Pro',
        description: 'For users committed to maximizing their potential',
        details: [
          'Exclusive one-on-one training sessions with elite trainers',
          'Access to top-tier gym facilities for unparalleled workouts'
        ],
        duration: '6 months',
        discount: '20'
      },
      {
        name: 'Exclusive',
        description: 'For users dedicated to achieving exceptional results',
        details: [
          'VIP training sessions for an unparalleled fitness experience',
          'Unlimited access to luxury gym centers offering unmatched amenities'
        ],
        duration: '9 to 12 months',
        discount: '50'
      }
    ];
  }
}
