import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { NotificationItemComponent } from './notification-item.component';

describe('NotificationItemComponent', () => {
  let component: NotificationItemComponent;
  let fixture: ComponentFixture<NotificationItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationItemComponent],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(NotificationItemComponent);
    component = fixture.componentInstance;
    component.item = { id: 1, notification: '', date: new Date().toISOString(), read: false } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Regression test for a stored-XSS fix: highlight() used to return the raw
  // notification text unescaped and was bound via [innerHTML] in the
  // template, so notification text containing markup rendered as live HTML
  // for anyone who viewed it (see form-validators.module.ts's escapeHtml()).
  describe('highlight() XSS fix', () => {
    it('escapes HTML in the notification text so it cannot execute as markup', () => {
      const result = component.highlight('<img src=x onerror="alert(1)">', '');
      expect(result).not.toContain('<img');
      expect(result).toContain('&lt;img');
    });

    it('still wraps a real search match in a highlight <span>', () => {
      const result = component.highlight('Your booking was completed', 'completed');
      expect(result).toContain('<span class="text-red-600 font-semibold">completed</span>');
    });

    it('escapes HTML even when a search query is active', () => {
      const result = component.highlight('<b>completed</b> today', 'completed');
      expect(result).not.toContain('<b>');
      expect(result).toContain('&lt;b&gt;');
      expect(result).toContain('<span class="text-red-600 font-semibold">completed</span>');
    });
  });
});
