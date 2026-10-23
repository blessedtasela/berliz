import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NEVER, of } from 'rxjs';

import { MyNotificationsComponent } from './my-notifications.component';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

describe('MyNotificationsComponent', () => {
  let component: MyNotificationsComponent;
  let fixture: ComponentFixture<MyNotificationsComponent>;

  beforeEach(() => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['markAsRead', 'bulkAction', 'deleteNotification']);
    const snackbarSpy = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    const rxStompSpy = jasmine.createSpyObj('RxStompService', ['watch']);
    rxStompSpy.watch.and.returnValue(NEVER);

    TestBed.configureTestingModule({
      declarations: [MyNotificationsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideMockStore(),
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: SnackBarService, useValue: snackbarSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: RxStompService, useValue: rxStompSpy }
      ]
    });
    fixture = TestBed.createComponent(MyNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('deep link (?id=)', () => {
    const many = (count: number): any[] =>
      Array.from({ length: count }, (_, i) => ({ id: i + 1, notification: `n${i + 1}`, date: new Date(), read: false }));

    function feed(list: any[], highlightId: number | null) {
      component.notificationData = list;
      component.highlightId = highlightId;
      component.ngOnChanges({ notificationData: new SimpleChange(null, list, false) });
      fixture.detectChanges();
    }

    it('jumps to the page that holds the highlighted notification', () => {
      feed(many(120), 110); // 50 per page -> index 109 is on page 3
      expect(component.currentPage).toBe(3);
      expect(component.isHighlighted({ id: 110 } as any)).toBeTrue();
      expect(component.isHighlighted({ id: 1 } as any)).toBeFalse();
    });

    it('stays on page 1 without a link', () => {
      feed(many(120), null);
      expect(component.currentPage).toBe(1);
    });

    it('jumps only once: a later refresh does not pull the user back to the highlighted page', () => {
      feed(many(120), 110);
      expect(component.currentPage).toBe(3);
      feed(many(121), 110); // e.g. a websocket reload
      expect(component.currentPage).toBe(1);
    });

    it('jumps again when the link points at a different notification', () => {
      feed(many(120), 110);
      component.highlightId = 5;
      component.ngOnChanges({ highlightId: new SimpleChange(110, 5, false) });
      expect(component.currentPage).toBe(1);
      component.highlightId = 60;
      component.ngOnChanges({ highlightId: new SimpleChange(5, 60, false) });
      expect(component.currentPage).toBe(2);
    });
  });

  it('says nothing matches (not "no notifications yet") when filters are narrowing an empty list', () => {
    component.filtered = true;
    component.notificationData = [];
    component.ngOnChanges({ notificationData: new SimpleChange(null, [], false) });
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nothing matches these filters');

    component.filtered = false;
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No notifications yet');
  });

  it('copyLink puts a link to this notification on the clipboard', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    await component.copyLink({ id: 42 } as any);
    expect(write).toHaveBeenCalledWith(`${window.location.origin}/dashboard/my-notifications?id=42`);
    expect(TestBed.inject(SnackBarService).openSnackBar).toHaveBeenCalledWith('Link to this notification copied', '');
  });
});
