import { Component, Input, OnInit } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { statistics, hero } from '../../models/landing.model';
import { DashboardService } from 'src/app/services/dashboard.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css'],
})

export class HeroSectionComponent implements OnInit {
  animationState = 'start';
  stats: statistics[] = [];
  heroes: hero[] = [];
  heroIndex = 0;
  partnerValue: any;
  memberValue: any;
  centerValue: any
  responseMessage: any;

  constructor(private dashboardService: DashboardService) {

  }

  ngOnInit() {
    this.heroCounter();
    this.getBerlizDetails();
    this.stats = [
      { id: 1, name: "Partners", iconUrl: "globe", value: 65, counterValue: 0 },
      { id: 2, name: "Centers", iconUrl: "map-pin", value: 23, counterValue: 0 },
      { id: 3, name: "Members", iconUrl: "users", value: 400, counterValue: 0 },
    ]

    this.heroes = [
      { id: 1, title: "Inspire and Transform Your Body with", image: "../../../assets/landing/landing-page-hero.jpg" },
      { id: 2, title: "Explore and Discover New Levels with ", image: "../../../assets/landing/gym-coach.jpg" },
      { id: 3, title: "Unleash Your Potentials with ", image: "../../../assets/landing/combat-sport.jpg" },
      { id: 4, title: "Fuel Your Body, Transform Your Life with ", image: "../../../assets/landing/gym-meal.jpg" }
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

  heroCounter() {
    setInterval(() => {
      this.changeHero(1);
    }, 5000);
  }

  changeHero(n: number): void {
    this.heroIndex = (this.heroIndex + n + this.heroes.length) % this.heroes.length;
  }

  getBerlizDetails() {
    this.dashboardService.getBerlizDetails()
      .subscribe((response: any) => {
        this.centerValue = response.centers;
        this.partnerValue = response.partners;
        this.memberValue = response.users;

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
