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
        buttonUrl: "/sign-up"
      },
      {
        id: 2,
        title: "Personal Trainers",
        subTitle: "One-on-One. All In.",
        description: "Get matched with elite Berliz-certified personal trainers who craft every rep around your goals, pace, and lifestyle — in person or online.",
        imageUrl: "../../../assets/landing/hero-personal-trainer.jpg",
        button: "Find your coach",
        buttonUrl: "/trainers"
      } ,
      {
        id: 3,
        title: "Body Building",
        subTitle: "Sculpt Strength. Build Legacy.",
        description: "Chisel your physique with intention. At Berliz, we build bodies that speak power and discipline.",
        imageUrl: "../../../assets/landing/hero-body-building.jpg",
        button: "Join us today",
        buttonUrl: "/sign-up"
      }, 
      {
        id: 4,
        title: "Martial Arts Schools",
        subTitle: "Discipline Meets Legacy",
        description: "Berliz connects you to top-tier martial arts academies. From Muay Thai to Karate, train where skill meets spirit.",
        imageUrl: "../../../assets/landing/hero-martial-school.jpg",
        button: "Find a school",
        buttonUrl: "/centers"
      },
       {
        id: 5,
        title: "Marketplace",
        subTitle: "Gear Up. Level Up.",
        description: "Explore premium fitness gear, supplements, and apparel curated for every discipline. The Berliz marketplace fuels your grind with quality and style.",
        imageUrl: "../../../assets/landing/hero-marketplace.jpg",
        button: "Shop Now",
        buttonUrl: "/shop"
      },
      {
        id: 6,
        title: "Virtual Coaching",
        subTitle: "Train Anywhere, Anytime",
        description: "No gym? No problem. Berliz brings expert trainers to your screen with real-time coaching that pushes results.",
        imageUrl: "../../../assets/landing/hero-virtual-coach.jpg",
        button: "Get started",
        buttonUrl: "/trainers"
      },
      {
        id: 7,
        title: "Fitness Centers Near You",
        subTitle: "Train Local, Go Global",
        description: "Browse verified gyms and training hubs in your area. Berliz bridges the gap between passion and location.",
        imageUrl: "../../../assets/landing/hero-gym-centers.jpg",
        button: "Explore now",
        buttonUrl: "/centers"
      },
     
      {
        id: 8,
        title: "Dieting",
        subTitle: "Fuel the Machine",
        description: "Discipline starts in the kitchen. Master your fuel, master your form — the Berliz way.",
        imageUrl: "../../../assets/landing/hero-diet.jpg",
        button: "Become a member",
        buttonUrl: "/sign-up"
      },
      {
        id: 9,
        title: "Calisthenics",
        subTitle: "Bodyweight. Battlefield.",
        description: "Redefine what your body can do. Unlock raw power with focused calisthenics at Berliz.",
        imageUrl: "../../../assets/landing/hero-calisthenics.jpg",
        button: "Join us now",
        buttonUrl: "/sign-up"
      },
       {
        id: 10,
        title: "Brazilian Jiu-jitsu",
        subTitle: "Discipline Over Domination",
        description: "Control the mat, control your mind. Embrace tactical strength with Berliz BJJ.",
        imageUrl: "../../../assets/landing/hero-bjj.jpg",
        button: "Join us today",
        buttonUrl: "/sign-up"
      },
      {
        id: 11,
        title: "Crossfit",
        subTitle: "Forge Resilience",
        description: "Train like an athlete. Berliz CrossFit pushes limits and hardens the will.",
        imageUrl: "../../../assets/landing/hero-crossfit.jpg",
        button: "Join our community",
        buttonUrl: "/sign-up"
      },
       {
        id: 12,
        title: "Weight Loss",
        subTitle: "Transform the Frame",
        description: "This isn’t about losing pounds. It’s about gaining power, confidence, and control — the Berliz transformation.",
        imageUrl: "../../../assets/landing/hero-weight-loss.jpg",
        button: "Join us now",
        buttonUrl: "/sign-up"
      },
     
     


    ];

    this.offers = [
      {
        id: 1,
        title: "Personalized Training Programs",
        description: "Train your way. From elite martial artists to personal fitness coaches, Berliz connects you with certified trainers tailored to your style, goals, and intensity.",
        subTitle: "Train with Purpose, Transform with Power",
        iconUrl: "Map"
      },
      {
        id: 2,
        title: "Nutritional Guidance",
        description: "Optimize performance with precision-crafted meal plans. Whether cutting, bulking, or balancing, Berliz pros deliver nutrition that works as hard as you do.",
        subTitle: "Discipline Starts on the Plate",
        iconUrl: "Activity"
      },
      {
        id: 3,
        title: "Flexible Membership Options",
        description: "Berliz fits your flow — from day passes to pro-tier subscriptions. Join your gym, martial arts school, or online coach all through one seamless platform.",
        subTitle: "No Excuses. Just Options.",
        iconUrl: "Layers"
      },
      {
        id: 4,
        title: "Community Support",
        description: "Surround yourself with high-performance people. Berliz connects you to a thriving community of trainees, trainers, and wellness warriors worldwide.",
        subTitle: "Forge Bonds. Fuel Growth.",
        iconUrl: "Users"
        ,
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
