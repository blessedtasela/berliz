import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { statistics, hero } from '../../models/landing.model';
import { DashboardService } from 'src/app/services/dashboard.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
    selector: 'app-hero-section',
    templateUrl: './hero-section.component.html',
    styleUrls: ['./hero-section.component.css'],
    standalone: false
})

export class HeroSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('heroVideo') heroVideo?: ElementRef<HTMLVideoElement>;

  animationState = 'start';
  stats: statistics[] = [];
  heroes: hero[] = [];
  heroIndex = 0;
  partnerValue: any;
  memberValue: any;
  centerValue: any
  responseMessage: any;

  constructor(
    private dashboardService: DashboardService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {

  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    // Keep the 9 MB background loop off the critical path: it only starts once everything else has loaded.
    if (document.readyState === 'complete') {
      setTimeout(() => this.startBackgroundVideo(), 0);
    } else {
      window.addEventListener('load', () => setTimeout(() => this.startBackgroundVideo(), 500), { once: true });
    }
  }

  /** Mobile, reduced-motion, data-saver and non-4g visitors keep the poster image and never download the video. */
  shouldPlayBackgroundVideo(): boolean {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false;
    if (window.matchMedia?.('(max-width: 767px)').matches) return false;
    const connection = (navigator as any).connection;
    if (connection?.saveData) return false;
    if (connection?.effectiveType && connection.effectiveType !== '4g') return false;
    return true;
  }

  private startBackgroundVideo(): void {
    const video = this.heroVideo?.nativeElement;
    if (!video || !this.shouldPlayBackgroundVideo()) return;
    video.muted = true;
    video.src = 'assets/fire-loop.mp4';
    video.play().catch(() => { /* autoplay refused: the poster stays */ });
  }

  ngOnInit() {
    // Never cleared, so during a one-shot build-time prerender (no ngOnDestroy)
    // this timer keeps Angular's zone permanently "unstable" and hangs the
    // render forever -- and auto-advancing a hero carousel makes no sense in a
    // static snapshot anyway.
    if (isPlatformBrowser(this.platformId)) {
      this.heroCounter();
    }
    this.getBerlizDetails();
    this.stats = [
      { id: 1, name: "Partners", iconUrl: "globe", value: 65, counterValue: 0 },
      { id: 2, name: "Centers", iconUrl: "map-pin", value: 23, counterValue: 0 },
      { id: 3, name: "Members", iconUrl: "users", value: 400, counterValue: 0 },
    ]

    this.heroes = [
      { id: 1, title: "Inspire and Transform Your Body with", image: "../../../assets/landing/landing10.jpeg" },
      { id: 2, title: "Explore and Discover New Levels with ", image: "../../../assets/landing/landing12.jpeg" },
      { id: 3, title: "Unleash Your Potentials with ", image: "../../../assets/landing/landing5.jpeg" },
      { id: 4, title: "Fuel Your Body, Transform Your Life with ", image: "../../../assets/landing/landing8.jpeg" }
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
        console.error(error)
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
      })
  }

}
