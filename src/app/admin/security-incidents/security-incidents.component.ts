import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { SecurityIncidentService } from 'src/app/services/security-incident.service';
import { SecurityEventRow, SecurityIncident } from 'src/app/models/security-incident.model';

/**
 * GN-67: the admin-facing side of the incident/ledger model. An incident starts OPEN; the
 * only way it changes is the explicit "Resolve" action below, which REQUIRES a note (the
 * ledger entry) and only ever sets ACTIONED or DISMISSED -- this page performs no action of
 * its own (no block/suspend/hold button here), it only records what the admin did elsewhere.
 */
@Component({
    selector: 'app-security-incidents',
    imports: [CommonModule, FormsModule, IconsModule, LoadErrorComponent],
    templateUrl: './security-incidents.component.html',
})
export class SecurityIncidentsComponent implements OnInit {
    incidents: SecurityIncident[] = [];
    loading = true;
    loadError = false;
    statusFilter = 'OPEN';

    selected: SecurityIncident | null = null;
    ledgerEvents: SecurityEventRow[] = [];
    ledgerLoading = false;
    resolveStatus: 'ACTIONED' | 'DISMISSED' = 'DISMISSED';
    resolveNote = '';
    resolving = false;
    resolveError: string | null = null;

    constructor(private securityIncidentService: SecurityIncidentService) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.loading = true;
        this.loadError = false;
        this.securityIncidentService.getIncidents(this.statusFilter || undefined)
            .pipe(take(1), catchError(() => { this.loadError = true; return of([]); }))
            .subscribe(res => {
                this.incidents = res ?? [];
                this.loading = false;
            });
    }

    setFilter(status: string): void {
        this.statusFilter = status;
        this.load();
    }

    open(incident: SecurityIncident): void {
        this.selected = incident;
        this.ledgerEvents = [];
        this.resolveNote = '';
        this.resolveStatus = 'DISMISSED';
        this.resolveError = null;
        this.ledgerLoading = true;
        this.securityIncidentService.getLedgerEvents(incident.id)
            .pipe(take(1), catchError(() => of([])))
            .subscribe(res => {
                this.ledgerEvents = res ?? [];
                this.ledgerLoading = false;
            });
    }

    close(): void {
        this.selected = null;
    }

    submitResolve(): void {
        if (!this.selected || !this.resolveNote.trim()) {
            this.resolveError = 'A note explaining the verdict is required.';
            return;
        }
        this.resolving = true;
        this.resolveError = null;
        this.securityIncidentService.resolve(this.selected.id, this.resolveStatus, this.resolveNote.trim())
            .pipe(take(1))
            .subscribe({
                next: () => {
                    this.resolving = false;
                    this.close();
                    this.load();
                },
                error: (err) => {
                    this.resolving = false;
                    this.resolveError = err?.error?.message || 'Could not resolve this incident.';
                },
            });
    }
}
