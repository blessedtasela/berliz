import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NEVER } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

import { NewsletterListComponent } from './newsletter-list.component';

describe('NewsletterListComponent', () => {
  let component: NewsletterListComponent;
  let fixture: ComponentFixture<NewsletterListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewsletterListComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideMockStore(),
        { provide: NewsletterService, useValue: jasmine.createSpyObj('NewsletterService', ['updateStatus', 'deleteNewsletter']) },
        { provide: NgxUiLoaderService, useValue: jasmine.createSpyObj('NgxUiLoaderService', ['start', 'stop']) },
        { provide: SnackBarService, useValue: jasmine.createSpyObj('SnackBarService', ['openSnackBar', 'dismiss']) },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: RxStompService, useValue: jasmine.createSpyObj('RxStompService', { watch: NEVER }) },
      ]
    });
    fixture = TestBed.createComponent(NewsletterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
