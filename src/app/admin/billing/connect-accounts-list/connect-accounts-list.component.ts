import { Component, OnInit } from '@angular/core';
import { StripeService } from 'src/app/services/stripe.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { ConnectAccountSummary } from 'src/app/models/stripe.model';
import { genericError } from 'src/validators/form-validators.module';

/** Admin — every provider with a Stripe Connect account, their cached onboarding status, and a per-row refresh. */
@Component({
  selector: 'app-connect-accounts-list',
  templateUrl: './connect-accounts-list.component.html',
  styleUrls: ['./connect-accounts-list.component.css'],
  standalone: false
})
export class ConnectAccountsListComponent implements OnInit {
  accounts: ConnectAccountSummary[] = [];
  loading = true;
  loadError: string | null = null;
  /** partnerId currently mid "Refresh from Stripe" call. */
  refreshingId: number | null = null;

  constructor(private stripeService: StripeService, private snackBar: SnackBarService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.stripeService.getAllConnectAccounts().subscribe({
      next: (response) => {
        this.accounts = response?.data ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.loadError = error.error?.message || error.error || genericError;
        this.loading = false;
      }
    });
  }

  providerName(account: ConnectAccountSummary): string {
    const name = [account.firstname, account.lastname].filter(Boolean).join(' ');
    return name || account.email || `Partner #${account.partnerId}`;
  }

  refresh(account: ConnectAccountSummary): void {
    if (this.refreshingId) return;
    this.refreshingId = account.partnerId;
    this.stripeService.refreshConnectAccountStatus(account.partnerId).subscribe({
      next: (response) => {
        this.refreshingId = null;
        const idx = this.accounts.findIndex(a => a.partnerId === account.partnerId);
        if (idx >= 0 && response?.data) this.accounts[idx] = response.data;
        this.snackBar.openSnackBar(response?.message || 'Status refreshed', '');
      },
      error: (error) => {
        this.refreshingId = null;
        this.snackBar.openSnackBar(error.error?.message || error.error || genericError, 'error');
      }
    });
  }
}
