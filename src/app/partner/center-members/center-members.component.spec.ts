import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { CenterMembersComponent } from './center-members.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';
import { loadMyCenterMembers } from 'src/app/state/center/center.actions';
import { selectMyCenterMembers } from 'src/app/state/center/center.selectors';
import { CenterMember } from 'src/app/models/centers.interface';

describe('CenterMembersComponent', () => {
  let component: CenterMembersComponent;
  let fixture: ComponentFixture<CenterMembersComponent>;
  let store: MockStore;
  let centerService: jasmine.SpyObj<CenterService>;

  const member = (over: Partial<CenterMember> = {}): CenterMember => ({
    id: 1,
    centerId: 1,
    centerName: 'Downtown Gym',
    userId: 5,
    memberName: 'Jane Doe',
    memberEmail: 'jane@example.com',
    status: 'false',
    date: new Date('2026-01-01'),
    lastUpdate: new Date('2026-01-01'),
    ...over,
  });

  beforeEach(() => {
    const mockNgxUiLoaderService = jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']);
    const mockSnackBarService = jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']);
    centerService = jasmine.createSpyObj('CenterService', ['addMember', 'updateMemberStatus', 'removeMember']);
    centerService.addMember.and.returnValue(of({ message: 'Member added', data: member(), success: true, statusCode: 200 }));
    centerService.updateMemberStatus.and.returnValue(of({ message: 'Status updated', data: member({ status: 'true' }), success: true, statusCode: 200 }));
    centerService.removeMember.and.returnValue(of({ message: 'Member removed', data: '', success: true, statusCode: 200 }));

    TestBed.configureTestingModule({
      declarations: [CenterMembersComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectMyCenterMembers, value: [member()] }] }),
        { provide: NgxUiLoaderService, useValue: mockNgxUiLoaderService },
        { provide: SnackBarService, useValue: mockSnackBarService },
        { provide: CenterService, useValue: centerService },
      ]
    });

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();

    fixture = TestBed.createComponent(CenterMembersComponent);
    component = fixture.componentInstance;
  });

  it('loads the center\'s own member roster from the store on init', () => {
    fixture.detectChanges();

    expect(store.dispatch).toHaveBeenCalledWith(loadMyCenterMembers());
    expect(component.centerMembers.length).toBe(1);
    expect(component.centerMembers[0].memberName).toBe('Jane Doe');
  });

  it('rejects an invalid email instead of calling the service', () => {
    fixture.detectChanges();
    component.toggleEditor();
    component.addMemberForm.patchValue({ memberEmail: 'not-an-email' });

    component.addMember();

    expect(component.invalidForm).toBeTrue();
    expect(centerService.addMember).not.toHaveBeenCalled();
  });

  it('addMember calls the service and reloads the roster on success', () => {
    fixture.detectChanges();
    component.toggleEditor();
    component.addMemberForm.patchValue({ memberEmail: 'new.member@example.com' });
    (store.dispatch as jasmine.Spy).calls.reset();

    component.addMember();

    expect(centerService.addMember).toHaveBeenCalledWith({ memberEmail: 'new.member@example.com' });
    expect(store.dispatch).toHaveBeenCalledWith(loadMyCenterMembers());
    expect(component.showEditor).toBeFalse();
  });

  it('toggleStatus calls updateMemberStatus for that member\'s id', () => {
    fixture.detectChanges();

    component.toggleStatus(member());

    expect(centerService.updateMemberStatus).toHaveBeenCalledWith(1);
  });

  it('removeMember calls removeMember for that member\'s id', () => {
    fixture.detectChanges();

    component.removeMember(member());

    expect(centerService.removeMember).toHaveBeenCalledWith(1);
  });

  it('isActive treats "false" as pending and "true" as active', () => {
    expect(component.isActive('false')).toBeFalse();
    expect(component.isActive('true')).toBeTrue();
  });
});
