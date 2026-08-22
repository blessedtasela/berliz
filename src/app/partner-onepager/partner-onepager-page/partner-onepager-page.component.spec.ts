import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { PartnerOnepagerPageComponent } from './partner-onepager-page.component';

describe('PartnerOnepagerPageComponent', () => {
  let component: PartnerOnepagerPageComponent;
  let fixture: ComponentFixture<PartnerOnepagerPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartnerOnepagerPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [Meta, Title]
    });
    fixture = TestBed.createComponent(PartnerOnepagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
