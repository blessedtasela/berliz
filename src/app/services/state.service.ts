import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Promotions } from '../models/promotion.model';
import { Offers } from '../models/offers.model';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private dataSubject = new BehaviorSubject<any>(null);
  public data$: Observable<any> = this.dataSubject.asObservable();
  promotions: Promotions[] = []
  offers: Offers[] = []
  private showNewsletter: boolean = false;
  private showTodaysTodo: string = 'false';
  constructor() {
    this.promotions = [
      {
        id: 1,
        title: "Boxing",
        subTitle: "The art of real combat",
        description: "Ignite Your Potential with Berliz",
        imageUrl: "../../../assets/landing/hero-boxing.jpg",
        button: "Join us now",
        buttonUrl: ""
      },
      {
        id: 2,
        title: "Body Building",
        subTitle: "The art of real combat",
        description: "Satisfy Your Passion with Berliz",
        imageUrl: "../../../assets/landing/hero-body-building.jpg",
        button: "Join us today",
        buttonUrl: ""
      },
      {
        id: 3,
        title: "Dieting",
        subTitle: "The art of real combat",
        description: "Discover a World of Limitless Services",
        imageUrl: "../../../assets/landing/hero-diet.jpg",
        button: "Become a member",
        buttonUrl: ""
      },
      {
        id: 4,
        title: "Calisthenics",
        subTitle: "The art of real combat",
        description: "Uncover Your Potentials with Us",
        imageUrl: "../../../assets/landing/hero-calisthenics.jpg",
        button: "Join us now",
        buttonUrl: ""
      },
      {
        id: 5,
        title: "Crossfit",
        subTitle: "The art of real combat",
        description: "Unlock Your Potentials with Us",
        imageUrl: "../../../assets/landing/hero-crossfit.jpg",
        button: "Join our community",
        buttonUrl: ""
      },
      {
        id: 6,
        title: "Brazilian Jiu-jistu",
        subTitle: "The art of real combat",
        description: "Embrace Your Power",
        imageUrl: "../../../assets/landing/hero-bjj.jpg",
        button: "Join us today",
        buttonUrl: ""
      },
      {
        id: 7,
        title: "Schedule Runs",
        subTitle: "The art of real combat",
        description: "Unleash Your Limitless",
        imageUrl: "../../../assets/landing/hero-run.jpg",
        button: "Sign up today",
        buttonUrl: ""
      },
      {
        id: 8,
        title: "Weight loss",
        subTitle: "The art of real combat",
        description: "Transform Your Life With Us",
        imageUrl: "../../../assets/landing/hero-weight-loss.jpg",
        button: "Join us now",
        buttonUrl: ""
      }
    ];

    this.offers = [
      {
        id: 1,
        title: "Personalized Training Programs",
        description: "Take your fitness journey to the next level with personalized one-on-one training " +
          "sessions with our Trainers from all over the world.",
        subTitle: "Ignite Your Potential with Berliz",
        iconUrl: "Map"
      },
      {
        id: 2,
        title: "Nutritional Guidance",
        description: "Our professionals will assist you in creating a balanced meal plan that complements " +
          "your fitness routine, helping you reach your desired physique.",
        subTitle: "Satisfy Your Passion with Berliz",
        iconUrl: "Activity"
      },
      {
        id: 3,
        title: "Flexible Membership Options",
        description: "Choose a membership plan that suits your needs. We offer flexible options, " +
          "including: standard, exclusive, and premium membership.",
        subTitle: "Discover a World of Limitless Services",
        iconUrl: "Layers"
      },
      {
        id: 4,
        title: "Community Support",
        description: "Join a vibrant fitness community where you can connect with like-minded " +
          "individuals, share your achievements, and find motivation and support along your fitness journey.",
        subTitle: "Uncover Your Potentials with Us",
        iconUrl: "Users"
      }
    ];
  }

  setData(data: any) {
    this.dataSubject.next(data);
  }

  setShowNewsletter(value: string) {
    localStorage.setItem("newsletter", value);
  }

  getShowNewsletter() {
    const value = localStorage.getItem("newsletter")
    return value;
  }

  setPauseNewsletter(value: boolean) {
    this.showNewsletter = value
  }

  getPauseNewsletter() {
    return this.showNewsletter;
  }

  setTodaysTodo(value: string) {
    localStorage.setItem("todaysTodo", value)
    this.showTodaysTodo = value;
  }

  getTodaysTodo() {
    const value = localStorage.getItem("todaysTodo")
    return value;
  }
}
