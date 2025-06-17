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
        subTitle: "Unleash Your Inner Fighter",
        description: "Step into the ring with confidence. At Berliz, every jab is purpose, every sweat builds legacy.",
        imageUrl: "../../../assets/landing/hero-boxing.jpg",
        button: "Join us now",
        buttonUrl: ""
      },
      {
        id: 2,
        title: "Body Building",
        subTitle: "Sculpt Strength. Build Legacy.",
        description: "Chisel your physique with intention. At Berliz, we build bodies that speak power and discipline.",
        imageUrl: "../../../assets/landing/hero-body-building.jpg",
        button: "Join us today",
        buttonUrl: ""
      },
      {
        id: 3,
        title: "Dieting",
        subTitle: "Fuel the Machine",
        description: "Discipline starts in the kitchen. Master your fuel, master your form — the Berliz way.",
        imageUrl: "../../../assets/landing/hero-diet.jpg",
        button: "Become a member",
        buttonUrl: ""
      },
      {
        id: 4,
        title: "Calisthenics",
        subTitle: "Bodyweight. Battlefield.",
        description: "Redefine what your body can do. Unlock raw power with focused calisthenics at Berliz.",
        imageUrl: "../../../assets/landing/hero-calisthenics.jpg",
        button: "Join us now",
        buttonUrl: ""
      },
      {
        id: 5,
        title: "Crossfit",
        subTitle: "Forge Resilience",
        description: "Train like an athlete. Berliz CrossFit pushes limits and hardens the will.",
        imageUrl: "../../../assets/landing/hero-crossfit.jpg",
        button: "Join our community",
        buttonUrl: ""
      },
      {
        id: 6,
        title: "Brazilian Jiu-jitsu",
        subTitle: "Discipline Over Domination",
        description: "Control the mat, control your mind. Embrace tactical strength with Berliz BJJ.",
        imageUrl: "../../../assets/landing/hero-bjj.jpg",
        button: "Join us today",
        buttonUrl: ""
      },
      {
        id: 7,
        title: "Schedule Runs",
        subTitle: "Momentum in Motion",
        description: "Run with purpose. Join guided runs that build endurance, grit, and community.",
        imageUrl: "../../../assets/landing/hero-run.jpg",
        button: "Sign up today",
        buttonUrl: ""
      },
      {
        id: 8,
        title: "Weight Loss",
        subTitle: "Transform the Frame",
        description: "This isn’t about losing pounds. It’s about gaining power, confidence, and control — the Berliz transformation.",
        imageUrl: "../../../assets/landing/hero-weight-loss.jpg",
        button: "Join us now",
        buttonUrl: ""
      }
    ];

    this.offers = [
      {
        id: 1,
        title: "Personalized Training Programs",
        description: "Unlock elite-level coaching with our global network of Berliz trainers. Every session is tailored to your goals, grit, and growth.",
        subTitle: "Train with Purpose, Transform with Power",
        iconUrl: "Map"
      },
      {
        id: 2,
        title: "Nutritional Guidance",
        description: "Fuel like a warrior. Our pros craft precise meal plans to optimize strength, endurance, and fat loss for sustainable results.",
        subTitle: "Discipline Starts on the Plate",
        iconUrl: "Activity"
      },
      {
        id: 3,
        title: "Flexible Membership Options",
        description: "Whether you’re all-in or just beginning, Berliz offers membership tiers that flex with your lifestyle — without compromise.",
        subTitle: "No Excuses. Just Options.",
        iconUrl: "Layers"
      },
      {
        id: 4,
        title: "Community Support",
        description: "You’re not alone. Connect with the Berliz tribe — push each other, grow together, and celebrate every milestone.",
        subTitle: "Forge Bonds. Fuel Growth.",
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


  setTodaysTodo(value: string) {
    localStorage.setItem("todaysTodo", value)
    this.showTodaysTodo = value;
  }

  getTodaysTodo() {
    const value = localStorage.getItem("todaysTodo")
    return value;
  }
}
