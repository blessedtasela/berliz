import { Component } from '@angular/core';

type BillingTab = 'overview' | 'payouts' | 'connect';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  standalone: false
})
export class BillingComponent {
  activeTab: BillingTab = 'overview';

  setTab(tab: BillingTab): void {
    this.activeTab = tab;
  }
}
