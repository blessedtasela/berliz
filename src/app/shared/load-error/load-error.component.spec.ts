import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadErrorComponent } from './load-error.component';

describe('LoadErrorComponent', () => {
  let fixture: ComponentFixture<LoadErrorComponent>;
  let component: LoadErrorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LoadErrorComponent] });
    fixture = TestBed.createComponent(LoadErrorComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture.destroy());

  function render(inputs: Partial<LoadErrorComponent>): HTMLElement {
    Object.assign(component, inputs);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders an alert with the title and message', () => {
    const el = render({ title: "Couldn't load X", message: 'Server said no' });

    const alert = el.querySelector('[role="alert"]');
    expect(alert).not.toBeNull();
    expect(alert!.textContent).toContain("Couldn't load X");
    expect(alert!.textContent).toContain('Server said no');
  });

  it('omits the message line when none is given', () => {
    const el = render({ title: 'Failed', message: null });

    expect(el.querySelectorAll('p').length).toBe(1);
  });

  it('emits retry when the button is clicked, in both layouts', () => {
    const spy = jasmine.createSpy('retry');
    component.retry.subscribe(spy);

    const block = render({ compact: false });
    (block.querySelector('button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledTimes(1);

    component.compact = true;
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('uses a custom retry label', () => {
    const el = render({ retryLabel: 'Reload hub' });

    expect(el.querySelector('button')!.textContent).toContain('Reload hub');
  });
});
