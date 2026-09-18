import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { MyTodoListItemComponent } from './my-todo-list-item.component';

describe('MyTodoListItemComponent', () => {
  let component: MyTodoListItemComponent;
  let fixture: ComponentFixture<MyTodoListItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTodoListItemComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(MyTodoListItemComponent);
    component = fixture.componentInstance;
    // A due date of exactly "now" sits right on isOverdue()/isDueSoon()'s boundary:
    // by the time Angular's automatic checkNoChanges pass re-evaluates the template,
    // real time has moved past it and isOverdue() flips from false to true, tripping
    // NG0100 (ExpressionChangedAfterItHasBeenCheckedError). Use a due date safely in
    // the future so both passes agree.
    component.todo = {
      id: 1,
      task: '',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      priority: 'normal'
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression test for a stored-XSS fix: highlight() used to return the raw
  // task text unescaped and was bound via [innerHTML] in the template, so a
  // task title containing markup rendered as live HTML for anyone who viewed
  // it (see form-validators.module.ts's escapeHtml()).
  describe('highlight() XSS fix', () => {
    it('escapes HTML in the task text so it cannot execute as markup', () => {
      component.searchQuery = '';
      const result = component.highlight('<img src=x onerror="alert(1)">');
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('still wraps a real search match in a highlight <span>', () => {
      component.searchQuery = 'gym';
      const result = component.highlight('Go to the gym today');
      expect(result).toContain('<span class="bg-yellow-200 rounded px-0.5">gym</span>');
    });

    it('escapes HTML even when a search query is active', () => {
      component.searchQuery = 'gym';
      const result = component.highlight('<b>gym</b> day');
      expect(result).not.toContain('<b>');
      expect(result).toContain('&lt;b&gt;');
      expect(result).toContain('<span class="bg-yellow-200 rounded px-0.5">gym</span>');
    });
  });
});
