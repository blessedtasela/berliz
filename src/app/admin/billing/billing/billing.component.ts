import { Component } from '@angular/core';
import { tabInUrl } from 'src/app/utils/tab-in-url';

type BillingTab = 'overview' | 'payouts' | 'connect';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
  standalone: false
})
export class BillingComponent {
  private tabUrl = tabInUrl<BillingTab>(['overview', 'payouts', 'connect'], 'overview');
  activeTab: BillingTab = this.tabUrl.fromUrl() ?? 'overview';

  setTab(tab: BillingTab): void {
    this.activeTab = tab;
    this.tabUrl.remember(tab);
  }
}
