import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { MemberDetailPageComponent } from './member-detail-page.component';
import { selectMembers } from 'src/app/state/member/member.selectors';

describe('MemberDetailPageComponent', () => {
  let component: MemberDetailPageComponent;
  let fixture: ComponentFixture<MemberDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MemberDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectMembers, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(MemberDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
