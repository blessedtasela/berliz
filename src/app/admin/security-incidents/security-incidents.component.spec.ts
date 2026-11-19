import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SecurityIncidentsComponent } from './security-incidents.component';
import { SecurityIncidentService } from 'src/app/services/security-incident.service';
import { SecurityIncident } from 'src/app/models/security-incident.model';

describe('SecurityIncidentsComponent', () => {
  let component: SecurityIncidentsComponent;
  let fixture: ComponentFixture<SecurityIncidentsComponent>;
  let serviceSpy: jasmine.SpyObj<SecurityIncidentService>;

  const openIncident: SecurityIncident = {
    id: 1, eventType: 'FAILED_LOGIN_SPIKE', subjectType: 'USER', subjectId: 'a@b.com',
    status: 'OPEN', eventCount: 3, firstEventAt: '2026-11-18T00:00:00Z', lastEventAt: '2026-11-18T01:00:00Z',
    ledger: null, resolvedAt: null,
  };

  beforeEach(() => {
    serviceSpy = jasmine.createSpyObj('SecurityIncidentService', ['getIncidents', 'getLedgerEvents', 'resolve']);
    serviceSpy.getIncidents.and.returnValue(of([openIncident]));
    serviceSpy.getLedgerEvents.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [SecurityIncidentsComponent],
      providers: [{ provide: SecurityIncidentService, useValue: serviceSpy }],
    });
    fixture = TestBed.createComponent(SecurityIncidentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads OPEN incidents by default', () => {
    expect(serviceSpy.getIncidents).toHaveBeenCalledWith('OPEN');
    expect(component.incidents).toEqual([openIncident]);
  });

  it('shows the error state and offers a retry when the load fails', () => {
    serviceSpy.getIncidents.and.returnValue(throwError(() => new Error('boom')));
    component.load();
    expect(component.loadError).toBeTrue();
    expect(component.loading).toBeFalse();
  });

  it('switching the status filter reloads with that status', () => {
    component.setFilter('DISMISSED');
    expect(serviceSpy.getIncidents).toHaveBeenCalledWith('DISMISSED');
  });

  it('opening an incident loads its ledger events', () => {
    component.open(openIncident);
    expect(serviceSpy.getLedgerEvents).toHaveBeenCalledWith(1);
    expect(component.selected).toBe(openIncident);
  });

  // GN-67's own guardrail: resolve() can't be submitted without a note.
  it('refuses to submit a resolve without a note', () => {
    component.open(openIncident);
    component.resolveNote = '   ';
    component.submitResolve();
    expect(serviceSpy.resolve).not.toHaveBeenCalled();
    expect(component.resolveError).toContain('note');
  });

  it('submits the verdict and reloads the list on success', () => {
    serviceSpy.resolve.and.returnValue(of({ ...openIncident, status: 'DISMISSED' }));
    component.open(openIncident);
    component.resolveNote = 'Checked the IP, it was the account owner travelling.';
    component.resolveStatus = 'DISMISSED';

    component.submitResolve();

    expect(serviceSpy.resolve).toHaveBeenCalledWith(1, 'DISMISSED', 'Checked the IP, it was the account owner travelling.');
    expect(component.selected).toBeNull();
    expect(serviceSpy.getIncidents).toHaveBeenCalledTimes(2);
  });

  it('surfaces the server error instead of silently failing when resolve fails', () => {
    serviceSpy.resolve.and.returnValue(throwError(() => ({ error: { message: 'Already resolved.' } })));
    component.open(openIncident);
    component.resolveNote = 'note';

    component.submitResolve();

    expect(component.resolveError).toBe('Already resolved.');
    expect(component.selected).toBe(openIncident, 'a failed resolve must not close the panel as if it worked');
  });
});
