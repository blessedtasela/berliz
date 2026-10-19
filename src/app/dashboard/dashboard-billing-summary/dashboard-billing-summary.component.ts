import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { BillingSummary } from 'src/app/models/billing-summary.model';

/** Admin-only dashboard-home widget -- the same billing numbers as /dashboard/billing's Overview tab, compacted. */
@Component({
  selector: 'app-dashboard-billing-summary',
  templateUrl: './dashboard-billing-summary.component.html',
  styleUrls: ['./dashboard-billing-summary.component.css'],
  standalone: false
})
export class DashboardBillingSummaryComponent implements OnInit {
  summary: BillingSummary | null = null;
  loading = true;
  loadError: string | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.dashboardService.getBillingSummary().subscribe({
      next: (summary) => {
        this.summary = summary;
        this.loading = false;
      },
      error: (error) => {
        this.loadError = error.error?.message || error.error || 'Could not load billing data.';
        this.loading = false;
      }
    });
  }
}
