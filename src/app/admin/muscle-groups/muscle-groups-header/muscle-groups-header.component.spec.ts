import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { EMPTY } from 'rxjs';
import { RxStompService } from 'src/app/services/rx-stomp.service';

import { MuscleGroupsHeaderComponent } from './muscle-groups-header.component';

describe('MuscleGroupsHeaderComponent', () => {
  let component: MuscleGroupsHeaderComponent;
  let fixture: ComponentFixture<MuscleGroupsHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MuscleGroupsHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        {
          provide: RxStompService,
          useValue: jasmine.createSpyObj('RxStompService', { watch: EMPTY }),
        },
        provideMockStore(),
      ],
    });
    fixture = TestBed.createComponent(MuscleGroupsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
