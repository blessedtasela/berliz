import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { MyCenterMembershipsComponent } from './my-center-memberships.component';
import { ApiResponse } from 'src/app/models/Api.interface';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterMember } from 'src/app/models/centers.interface';

describe('MyCenterMembershipsComponent', () => {
  let component: MyCenterMembershipsComponent;
  let fixture: ComponentFixture<MyCenterMembershipsComponent>;
  let centerService: jasmine.SpyObj<CenterService>;
  let snackbar: jasmine.SpyObj<SnackBarService>;

  const membership = (over: Partial<CenterMember> = {}): CenterMember => ({
    id: 1,
    centerId: 2,
    centerName: 'Downtown Gym',
    userId: 10,
    memberName: 'Jane Doe',
    memberEmail: 'jane@example.com',
    status: 'true',
    date: new Date('2026-01-01'),
    lastUpdate: new Date('2026-01-01'),
    ...over,
  });

  function setup(response$: Observable<ApiResponse<CenterMember[]>>) {
    centerService = jasmine.createSpyObj('CenterService', ['getMyCenterMemberships']);
    centerService.getMyCenterMemberships.and.returnValue(response$);
    snackbar = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);

    TestBed.configureTestingModule({
      imports: [MyCenterMembershipsComponent],
      providers: [
        provideRouter([]),
        { provide: CenterService, useValue: centerService },
        { provide: SnackBarService, useValue: snackbar },
      ],
    });

    fixture = TestBed.createComponent(MyCenterMembershipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads and shows the centers the user is a member of', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [membership()] }));

    expect(component.loading).toBeFalse();
    expect(component.memberships.length).toBe(1);
    expect(component.memberships[0].centerName).toBe('Downtown Gym');
  });

  it('shows the genuine empty state when the user has no memberships', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain("You're not on any center's roster yet");
  });

  it('shows a retryable error instead of the empty state when the load fails', () => {
    setup(throwError(() => ({ error: { message: 'Server exploded' } })));

    expect(component.loadError).toBe('Server exploded');
    expect(snackbar.openSnackBar).toHaveBeenCalledWith('Server exploded', 'error');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).not.toContain("You're not on any center's roster yet");
  });

  it('distinguishes pending from active membership status', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));
    expect(component.isActive('false')).toBeFalse();
    expect(component.isActive('true')).toBeTrue();
  });

  it('centerSlug turns a center name into the URL slug used for its profile route', () => {
    setup(of({ message: '', success: true, statusCode: 200, data: [] }));
    expect(component.centerSlug('Downtown Gym')).toBe('downtown-gym');
  });
});
