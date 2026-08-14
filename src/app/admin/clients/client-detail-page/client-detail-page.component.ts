import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Clients } from 'src/app/models/clients.interface';
import { loadClients } from 'src/app/state/client/client.actions';
import { selectClients } from 'src/app/state/client/client.selectors';

/**
 * Routed detail page for a single client — `/dashboard/clients/:id`
 * (also reachable via `/dashboard/hub/clients/:id`, same lazy module).
 *
 * Replaces the old ClientsDetailsModalComponent dialog. Content is ported
 * as-is. No get-by-id endpoint exists for clients, so this looks the client
 * up in the already-loaded `clients` slice and dispatches `loadClients()` if
 * it is empty (direct link / refresh).
 */
@Component({
  selector: 'app-client-detail-page',
  templateUrl: './client-detail-page.component.html',
  styleUrls: ['./client-detail-page.component.css']
})
export class ClientDetailPageComponent implements OnInit, OnDestroy {
  clientData: Clients | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.clientData = null;
          return;
        }
        this.loadClient(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadClient(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectClients)
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => {
        const found = (clients || []).find(client => client.id === id);
        if (found) {
          this.clientData = found;
          this.loading = false;
        } else if (!clients || clients.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadClients());
          }
        } else {
          this.clientData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
