import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { AdminCmsComponent } from './admin-cms.component';
import { AdminCmsService, CmsEntity } from 'src/app/services/admin-cms.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

describe('AdminCmsComponent', () => {
  let component: AdminCmsComponent;
  let fixture: ComponentFixture<AdminCmsComponent>;
  let cms: jasmine.SpyObj<AdminCmsService>;
  let snack: jasmine.SpyObj<SnackBarService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const columns = [
    { name: 'id', type: 'Integer', editable: false },
    { name: 'status', type: 'String', editable: true },
    { name: 'amount', type: 'BigDecimal', editable: true },
    { name: 'paid', type: 'Boolean', editable: true },
  ];
  const booking: CmsEntity = { key: 'booking', label: 'Booking', columns };
  const page = (items: any[], total = items.length) => of({ data: { items, total, page: 0, size: 25, columns } } as any);

  beforeEach(() => {
    cms = jasmine.createSpyObj('AdminCmsService', ['entities', 'list', 'update', 'delete', 'get']);
    cms.entities.and.returnValue(of({ data: [booking, { key: 'post', label: 'Post', columns: [] }] } as any));
    snack = jasmine.createSpyObj('SnackBarService', ['openSnackBar']);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      imports: [AdminCmsComponent],
      providers: [
        { provide: AdminCmsService, useValue: cms },
        { provide: SnackBarService, useValue: snack },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(AdminCmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the record types and filters them by name', () => {
    expect(component.entities.length).toBe(2);
    component.entityFilter = 'pos';
    expect(component.filteredEntities.map(e => e.key)).toEqual(['post']);
  });

  it('shows a retryable error when the record types cannot be loaded', () => {
    cms.entities.and.returnValue(throwError(() => ({ error: { message: 'Forbidden' } })));
    component.loadEntities();
    expect(component.loadError).toBe('Forbidden');
    expect(component.loadingEntities).toBeFalse();
  });

  it('loads the first page of a type when it is picked', () => {
    cms.list.and.returnValue(page([{ id: 1, status: 'new', amount: 5, paid: false }], 60));
    component.select(booking);
    expect(cms.list).toHaveBeenCalledWith('booking', 0, 25, '');
    expect(component.rows.length).toBe(1);
    expect(component.pageCount).toBe(3);
  });

  it('pages forward and back within bounds', () => {
    cms.list.and.returnValue(page([{ id: 1 }], 60));
    component.select(booking);
    component.prev();
    expect(component.page).toBe(0);
    component.next();
    component.next();
    component.next();
    expect(component.page).toBe(2);
    expect(cms.list).toHaveBeenCalledWith('booking', 2, 25, '');
  });

  it('searches after a short pause and goes back to the first page', fakeAsync(() => {
    cms.list.and.returnValue(page([]));
    component.select(booking);
    component.page = 2;
    cms.list.calls.reset();
    component.onSearch('sam');
    tick(100);
    expect(cms.list).not.toHaveBeenCalled();
    tick(300);
    expect(cms.list).toHaveBeenCalledOnceWith('booking', 0, 25, 'sam');
  }));

  it('shows a retryable error when the rows cannot be loaded', () => {
    cms.list.and.returnValue(throwError(() => ({ error: { message: 'Nope' } })));
    component.select(booking);
    expect(component.loadError).toBe('Nope');
    expect(component.rows).toEqual([]);
  });

  describe('editing', () => {
    const row = { id: 1, status: 'new', amount: 5, paid: false };

    beforeEach(() => {
      cms.list.and.returnValue(page([row]));
      component.select(booking);
      component.open(row);
    });

    it('starts with nothing to save and only the editable fields in the form', () => {
      expect(Object.keys(component.form)).toEqual(['status', 'amount', 'paid']);
      expect(component.hasChanges).toBeFalse();
    });

    it('sends only the fields that changed', () => {
      cms.update.and.returnValue(of({ data: { ...row, status: 'done' } } as any));
      component.form['status'] = 'done';
      component.save();
      expect(cms.update).toHaveBeenCalledOnceWith('booking', 1, { status: 'done' });
      expect(snack.openSnackBar).toHaveBeenCalledWith('Saved', '');
      expect(component.rows[0]['status']).toBe('done');
      expect(component.saving).toBeFalse();
    });

    it('does not call the server when nothing changed', () => {
      component.save();
      expect(cms.update).not.toHaveBeenCalled();
    });

    it('keeps the editor open and shows the server message when the save is refused', () => {
      cms.update.and.returnValue(throwError(() => ({ error: { message: 'Bad value' } })));
      component.form['amount'] = 'abc';
      component.save();
      expect(component.formError).toBe('Bad value');
      expect(component.editing).toBe(row);
      expect(component.saving).toBeFalse();
    });

    it('ignores a second save while one is in flight', () => {
      component.saving = true;
      component.form['status'] = 'done';
      component.save();
      expect(cms.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      cms.list.and.returnValue(page([{ id: 1 }]));
      component.select(booking);
    });

    it('asks first and does nothing when declined', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(false) } as any);
      component.remove({ id: 1 });
      expect(cms.delete).not.toHaveBeenCalled();
    });

    it('deletes after confirmation and reloads the list', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      cms.delete.and.returnValue(of({ message: 'Deleted' } as any));
      cms.list.calls.reset();
      component.remove({ id: 1 });
      expect(cms.delete).toHaveBeenCalledOnceWith('booking', 1);
      expect(cms.list).toHaveBeenCalled();
    });

    it('shows the server message when the delete is refused', () => {
      dialog.open.and.returnValue({ afterClosed: () => of(true) } as any);
      cms.delete.and.returnValue(throwError(() => ({ error: { message: 'Only a super admin can delete this' } })));
      component.remove({ id: 1 });
      expect(snack.openSnackBar).toHaveBeenCalledWith('Only a super admin can delete this', 'error');
    });
  });
});
