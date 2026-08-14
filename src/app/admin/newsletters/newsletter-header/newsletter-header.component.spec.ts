import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER } from 'rxjs';
import { RxStompService } from 'src/app/services/rx-stomp.service';

import { NewsletterHeaderComponent } from './newsletter-header.component';

describe('NewsletterHeaderComponent', () => {
  let component: NewsletterHeaderComponent;
  let fixture: ComponentFixture<NewsletterHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterHeaderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore(),
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: RxStompService, useValue: jasmine.createSpyObj('RxStompService', { watch: NEVER }) },
      ]
    });
    fixture = TestBed.createComponent(NewsletterHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
