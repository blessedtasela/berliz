import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';

import { ClientIntake } from 'src/app/models/client-intake.model';
import { loadMyClientIntakes } from 'src/app/state/client-intake/client-intake.actions';
import { selectMyClientIntakes } from 'src/app/state/client-intake/client-intake.selectors';

/**
 * Trainer-facing list of every client intake this trainer has created —
 * GET /client-intake/getMyIntakes. Deliberately trainer-scoped only: a
 * trainer never sees intakes created by another trainer, even for the same
 * client (see ClientIntakeServiceImplement's access-control note).
 */
@Component({
  selector: 'app-my-client-intakes',
  templateUrl: './my-client-intakes.component.html',
  styleUrls: ['./my-client-intakes.component.css']
})
export class MyClientIntakesComponent implements OnInit, OnDestroy {

  intakes: ClientIntake[] = [];

  private destroy$ = new Subject<void>();

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyClientIntakes());
    this.store.select(selectMyClientIntakes)
      .pipe(takeUntil(this.destroy$))
      .subscribe(intakes => this.intakes = intakes ?? []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clientName(intake: ClientIntake): string {
    return `${intake.clientFirstname ?? ''} ${intake.clientLastname ?? ''}`.trim() || intake.clientEmail || 'Client';
  }
}
