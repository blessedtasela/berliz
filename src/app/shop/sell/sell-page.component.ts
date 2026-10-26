import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store as NgRxStore } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { Partner } from 'src/app/models/partners.interface';
import { Store } from 'src/app/models/store.model';
import { PartnerService } from 'src/app/services/partner.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StoreService } from 'src/app/services/store.service';
import { loadMyPartner } from 'src/app/state/partner/partner.actions';
import { selectMyPartner } from 'src/app/state/partner/partner.selectors';

/**
 * `/shop/sell` — the Shop seller surface. One of four states, in order:
 * 1. No "store"-role Partner application yet -> apply (lightweight: just a motivation statement,
 *    nothing like the trainer/center form's certification/resume/feature-video requirements).
 * 2. Applied, waiting on admin approval -> status message.
 * 3. Approved, hasn't created a store yet -> create-store form.
 * 4. Store created -> manage it (edit profile, list/edit/remove products).
 */
@Component({
  selector: 'app-sell-page',
  templateUrl: './sell-page.component.html',
  styleUrls: ['./sell-page.component.css'],
  standalone: false
})
export class SellPageComponent implements OnInit, OnDestroy {
  loading = true;
  partner: Partner | null = null;
  store: Store | null = null;

  applying = false;
  motivation = '';

  private destroy$ = new Subject<void>();

  get hasStoreApplication(): boolean {
    return !!this.partner && this.partner.role === 'store';
  }

  get isApproved(): boolean {
    return this.hasStoreApplication && this.partner?.status === 'true';
  }

  get isPending(): boolean {
    return this.hasStoreApplication && this.partner?.status !== 'true' && this.partner?.status !== 'rejected';
  }

  get isRejected(): boolean {
    return this.hasStoreApplication && this.partner?.status === 'rejected';
  }

  constructor(
    private ngrxStore: NgRxStore,
    private partnerService: PartnerService,
    private storeService: StoreService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.ngrxStore.dispatch(loadMyPartner());
    this.ngrxStore.select(selectMyPartner)
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe(partner => {
        this.partner = partner ?? null;
        this.loading = false;
        if (this.hasStoreApplication && this.isApproved) this.fetchMyStore();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchMyStore(): void {
    this.storeService.getMyStore().subscribe({
      next: res => this.store = res?.data ?? null,
      error: () => this.store = null,
    });
  }

  /** Called by the store-management child once it creates the store, so this page re-renders into "manage" state. */
  onStoreCreated(store: Store): void {
    this.store = store;
  }

  submitApplication(): void {
    const motivation = this.motivation.trim();
    if (!motivation || this.applying) return;

    this.applying = true;
    this.partnerService.addPartner({ role: 'store', motivation }).subscribe({
      next: (res: any) => {
        this.applying = false;
        this.snackBar.openSnackBar(res?.message || 'Your seller application has been submitted.', '');
        this.ngrxStore.dispatch(loadMyPartner());
      },
      error: (err: any) => {
        this.applying = false;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not submit your application — try again.', 'error');
      },
    });
  }
}
