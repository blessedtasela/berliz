import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconsModule } from 'src/app/icons/icons.module';

import { HelpCenterPageComponent } from './help-center-page.component';

describe('HelpCenterPageComponent', () => {
  let component: HelpCenterPageComponent;
  let fixture: ComponentFixture<HelpCenterPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HelpCenterPageComponent],
      imports: [RouterTestingModule, IconsModule]
    });
    fixture = TestBed.createComponent(HelpCenterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders every support category as a heading', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    for (const category of component.categories) {
      expect(text).toContain(category.label);
    }
  });

  it('links to the real FAQ page and to Report a Problem', () => {
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('a'))
      .map(a => a.getAttribute('routerLink') || a.getAttribute('ng-reflect-router-link'));

    expect(links).toContain('/services/faqs');
    expect(links).toContain('/report-problem');
  });

  it('starts with every article collapsed, and toggle() expands/collapses by id', () => {
    const firstArticleId = component.categories[0].articles[0].id;
    expect(component.isExpanded(firstArticleId)).toBeFalse();

    component.toggle(firstArticleId);
    expect(component.isExpanded(firstArticleId)).toBeTrue();

    component.toggle(firstArticleId);
    expect(component.isExpanded(firstArticleId)).toBeFalse();
  });
});
