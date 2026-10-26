import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { IconsModule } from 'src/app/icons/icons.module';
import { Plan } from 'src/app/models/plan.model';
import { PlanService } from 'src/app/services/plan.service';

export interface PlanGroup {
  role: Plan['targetRole'];
  title: string;
  blurb: string;
  plans: Plan[];
}

const GROUPS: { role: Plan['targetRole']; title: string; blurb: string }[] = [
  { role: 'client', title: 'For members', blurb: 'Train with trainers and centers on Berliz.' },
  { role: 'trainer', title: 'For trainers', blurb: 'Run your coaching business on Berliz.' },
  { role: 'center', title: 'For gyms and centers', blurb: 'List your center, its trainers and its memberships.' },
];

/**
 * /pricing: what it costs, without an account. The platform's own subscription tiers, plus where session, pack and
 * membership prices live (each trainer and center sets their own, shown on their profile). All amounts are in Canadian dollars.
 */
@Component({
  selector: 'app-pricing-page',
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './pricing-page.component.html',
})
export class PricingPageComponent implements OnInit {
  groups: PlanGroup[] = [];
  loading = true;
  loadError = false;

  constructor(private planService: PlanService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.planService.getActivePlans().subscribe({
      next: res => {
        this.groups = groupPlans(res?.data ?? []);
        this.loading = false;
      },
      error: () => {
        this.loadError = true;
        this.loading = false;
      },
    });
  }

  intervalLabel(plan: Plan): string {
    return plan.billingInterval === 'monthly' || !plan.billingInterval ? 'per month' : `per ${plan.billingInterval}`;
  }

  trackById(_: number, p: Plan): number { return p.id; }
}

/** Active plans grouped by who they are for, in their set order (then cheapest first); empty groups are dropped. */
export function groupPlans(plans: Plan[]): PlanGroup[] {
  return GROUPS
    .map(g => ({
      ...g,
      plans: plans
        .filter(p => p.isActive !== false && p.targetRole === g.role)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.price - b.price),
    }))
    .filter(g => g.plans.length > 0);
}
