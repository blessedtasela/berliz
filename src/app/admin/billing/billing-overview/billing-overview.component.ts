import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard.service';
import { BillingSummary } from 'src/app/models/billing-summary.model';

@Component({
  selector: 'app-billing-overview',
  templateUrl: './billing-overview.component.html',
  styleUrls: ['./billing-overview.component.css'],
  standalone: false
})
export class BillingOverviewComponent implements OnInit {
  summary: BillingSummary | null = null;
  loading = true;
  /** Why the summary couldn't be loaded -- so a failed load never reads as "everything is zero". */
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
        this.loadError = error.error?.message || error.error || 'Could not load the billing summary.';
        this.loading = false;
      }
    });
  }
}
