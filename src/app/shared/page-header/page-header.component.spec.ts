import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHeaderComponent } from './page-header.component';

describe('PageHeaderComponent', () => {
  let fixture: ComponentFixture<PageHeaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PageHeaderComponent] });
    fixture = TestBed.createComponent(PageHeaderComponent);
  });

  it('shows the title and subtitle', () => {
    fixture.componentRef.setInput('icon', 'users');
    fixture.componentRef.setInput('title', 'Users');
    fixture.componentRef.setInput('subtitle', 'Every account on Berliz');
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Users');
    expect(text).toContain('Every account on Berliz');
    expect(fixture.nativeElement.querySelector('h1')).toBeTruthy();
  });

  it('omits the subtitle line when there is none', () => {
    fixture.componentRef.setInput('icon', 'users');
    fixture.componentRef.setInput('title', 'Users');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p')).toBeNull();
  });
});
