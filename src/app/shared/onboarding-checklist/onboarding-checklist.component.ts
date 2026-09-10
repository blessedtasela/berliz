import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { ConnectionService } from 'src/app/services/connection.service';

interface OnboardingStep {
  key: string;
  label: string;
  hint: string;
  icon: string;
  link: string[];
  done: boolean;
  /** true → completion is just "they followed the link once" (localStorage), not data-derived. */
  clickToComplete?: boolean;
}

const DISMISS_KEY = 'berliz.onboarding.v1.dismissed';

/**
 * D12 — value-first onboarding. A dismissible, role-aware first-run checklist
 * that sits at the very top of the dashboard home, so a new user is pointed at
 * a real action (log a workout / connect / find a provider) before they ever
 * reach a pricing surface. Auto-hides once every step is done or on dismiss.
 */
@Component({
  selector: 'app-onboarding-checklist',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  template: `
    <div *ngIf="visible" class="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-0.5">
          <h2 class="text-sm font-bold text-gray-900">Get started on Berliz</h2>
          <p class="text-[11px] text-gray-400">{{ doneCount }} of {{ steps.length }} done — no subscription needed for any of this.</p>
        </div>
        <button type="button" (click)="dismiss()" title="Dismiss"
          class="text-gray-300 hover:text-gray-600 transition p-1 shrink-0">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div class="h-full bg-red-600 transition-all" [style.width.%]="progressPct"></div>
      </div>

      <div class="flex flex-col divide-y divide-gray-50">
        <a *ngFor="let step of steps" [routerLink]="step.link" (click)="markClicked(step)"
          class="flex items-center gap-3 py-2.5 group">
          <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition"
            [ngClass]="step.done ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-300 group-hover:text-red-500'">
            <i-feather [name]="step.done ? 'check' : step.icon" style="width:12px;height:12px;"></i-feather>
          </span>
          <span class="flex-1 min-w-0">
            <span class="text-xs font-bold block" [ngClass]="step.done ? 'text-gray-400 line-through' : 'text-gray-800'">{{ step.label }}</span>
            <span class="text-[11px] text-gray-400">{{ step.hint }}</span>
          </span>
          <i-feather *ngIf="!step.done" name="arrow-right" class="text-gray-300 group-hover:text-red-500 transition shrink-0" style="width:13px;height:13px;"></i-feather>
        </a>
      </div>
    </div>
  `,
})
export class OnboardingChecklistComponent implements OnInit {
  steps: OnboardingStep[] = [];
  visible = false;

  constructor(
    private authService: AuthService,
    private workoutService: WorkoutService,
    private connectionService: ConnectionService,
  ) {}

  ngOnInit(): void {
    if (this.readFlag(DISMISS_KEY)) return;

    const role = (this.authService.getCurrentUserRole() || '').toLowerCase();
    this.steps = this.buildSteps(role);
    this.visible = true;

    forkJoin({
      workouts: this.workoutService.getMyWorkoutLogs().pipe(catchError(() => of(null))),
      connections: this.connectionService.getMyConnections().pipe(catchError(() => of(null))),
    })
      .pipe(take(1))
      .subscribe(({ workouts, connections }) => {
        const hasWorkout = !!(workouts?.data && workouts.data.length > 0);
        const hasConnection = !!(connections?.data && connections.data.length > 0);
        this.setDone('log-workout', hasWorkout);
        this.setDone('connect', hasConnection);
        this.setDone('post', hasWorkout); // trainers: a shared workout counts as a first post
        this.refreshVisibility();
      });
  }

  private buildSteps(role: string): OnboardingStep[] {
    const clicked = (key: string) => this.readFlag(this.stepFlag(key));

    if (role === 'trainer' || role === 'center') {
      return [
        { key: 'profile', label: 'Complete your profile', hint: 'Photo, bio and what you offer', icon: 'user', link: ['/dashboard/profile'], done: clicked('profile'), clickToComplete: true },
        { key: 'post', label: 'Share your first post', hint: 'Introduce yourself to the network', icon: 'edit-3', link: ['/dashboard/timeline'], done: false },
        { key: 'connect', label: 'Connect with a member', hint: 'Grow your network', icon: 'users', link: ['/dashboard/member-directory'], done: false },
      ];
    }

    return [
      { key: 'log-workout', label: 'Log your first workout', hint: 'Track a session, run or lift', icon: 'activity', link: ['/dashboard/workouts'], done: false },
      { key: 'connect', label: 'Connect with someone', hint: 'Find people to train with', icon: 'users', link: ['/dashboard/member-directory'], done: false },
      { key: 'find-provider', label: 'Find a trainer or gym', hint: 'Browse providers near you', icon: 'search', link: ['/dashboard/find-providers'], done: clicked('find-provider'), clickToComplete: true },
    ];
  }

  markClicked(step: OnboardingStep): void {
    if (!step.clickToComplete || step.done) return;
    this.writeFlag(this.stepFlag(step.key), '1');
    step.done = true;
    this.refreshVisibility();
  }

  dismiss(): void {
    this.writeFlag(DISMISS_KEY, '1');
    this.visible = false;
  }

  get doneCount(): number {
    return this.steps.filter(s => s.done).length;
  }

  get progressPct(): number {
    return this.steps.length ? Math.round((this.doneCount / this.steps.length) * 100) : 0;
  }

  private setDone(key: string, done: boolean): void {
    const step = this.steps.find(s => s.key === key);
    if (step && !step.clickToComplete) step.done = done;
  }

  private refreshVisibility(): void {
    if (this.steps.length && this.steps.every(s => s.done)) this.visible = false;
  }

  private stepFlag(key: string): string {
    return `berliz.onboarding.v1.step.${key}`;
  }

  private readFlag(key: string): boolean {
    try {
      return localStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  }

  private writeFlag(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private mode / storage disabled — the checklist just won't remember */
    }
  }
}
