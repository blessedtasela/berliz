import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowItWorksComponent } from './how-it-works.component';

describe('HowItWorksComponent', () => {
  let fixture: ComponentFixture<HowItWorksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HowItWorksComponent] });
    fixture = TestBed.createComponent(HowItWorksComponent);
  });

  const section = () => fixture.nativeElement.querySelector('section') as HTMLElement;

  it('is dark by default, for the public profile', () => {
    fixture.detectChanges();
    expect(section().className).toContain('bg-zinc-900');
  });

  it('follows the light/dark toggle in the dashboard', () => {
    fixture.componentRef.setInput('theme', 'light');
    fixture.detectChanges();
    expect(section().className).toContain('bg-white');
    expect(section().className).not.toContain('bg-zinc-900');
  });

  it('names the provider and shows three steps', () => {
    fixture.componentRef.setInput('providerLabel', 'this center');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('li').length).toBe(3);
    expect(fixture.nativeElement.textContent).toContain("this center's open hours");
  });
});
