import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { ClientDetailPageComponent } from './client-detail-page.component';
import { selectClients } from 'src/app/state/client/client.selectors';

describe('ClientDetailPageComponent', () => {
  let component: ClientDetailPageComponent;
  let fixture: ComponentFixture<ClientDetailPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClientDetailPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore({ selectors: [{ selector: selectClients, value: [] }] }),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } }
      ]
    });

    fixture = TestBed.createComponent(ClientDetailPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
