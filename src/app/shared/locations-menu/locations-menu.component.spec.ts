import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationMenuItem, LocationsMenuComponent } from './locations-menu.component';

describe('LocationsMenuComponent', () => {
  let fixture: ComponentFixture<LocationsMenuComponent>;
  let component: LocationsMenuComponent;

  const items: LocationMenuItem[] = [
    { title: "Mike's Gym", subtitle: 'Surrey, BC, Canada', href: 'https://maps.example/1', note: '+$15.00', noteHighlight: true },
    { title: 'Vancouver, BC, Canada', href: 'https://maps.example/2', note: 'No extra fee' },
    { title: 'Burnaby, Canada', href: 'https://maps.example/3', note: 'No extra fee' },
  ];

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const tile = () => (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LocationsMenuComponent] });
    fixture = TestBed.createComponent(LocationsMenuComponent);
    component = fixture.componentInstance;
  });

  it('says how many locations there are and how many more beyond the first', () => {
    component.summary = 'Surrey, Canada';
    component.items = items;
    fixture.detectChanges();
    expect(text()).toContain('3 locations');
    expect(text()).toContain('+2 more');
  });

  it('lists every location with its venue and fee once the tile is clicked', () => {
    component.items = items;
    fixture.detectChanges();
    expect(text()).not.toContain("Mike's Gym");

    tile().click();
    fixture.detectChanges();

    expect(text()).toContain("Mike's Gym");
    expect(text()).toContain('Surrey, BC, Canada');
    expect(text()).toContain('+$15.00');
    expect(text()).toContain('Burnaby, Canada');
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a[role="menuitem"]');
    expect(links.length).toBe(3);
    expect(links[0].getAttribute('href')).toBe('https://maps.example/1');
  });

  it('shows the footer row (client-chosen location) inside the dropdown', () => {
    component.items = items;
    component.footer = { text: 'Or train at a place of your choice', note: '+$25.00', noteHighlight: true };
    fixture.detectChanges();
    tile().click();
    fixture.detectChanges();
    expect(text()).toContain('Or train at a place of your choice');
    expect(text()).toContain('+$25.00');
  });

  it('opens for a single location too, without a "+N more" label', () => {
    component.items = [items[0]];
    fixture.detectChanges();
    expect(text()).toContain('1 location');
    expect(text()).not.toContain('more');
    tile().click();
    fixture.detectChanges();
    expect(text()).toContain("Mike's Gym");
  });

  it('does not open when there is nothing to list', () => {
    component.items = [];
    fixture.detectChanges();
    tile().click();
    fixture.detectChanges();
    expect(component.open).toBeFalse();
    expect(text()).not.toContain('location');
  });

  it('closes on an outside click and on Escape', () => {
    component.items = items;
    fixture.detectChanges();
    tile().click();
    fixture.detectChanges();
    expect(component.open).toBeTrue();

    document.body.click();
    expect(component.open).toBeFalse();

    tile().click();
    expect(component.open).toBeTrue();
    component.onEscape();
    expect(component.open).toBeFalse();
  });
  it('stays open when the click lands on the chevron icon inside the tile', () => {
    component.items = items;
    fixture.autoDetectChanges(true);
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    try {
      // The chevron is swapped (chevron-down -> chevron-up) as part of the same
      // click, so by the time the click reaches `document` the clicked node is
      // detached from the tile. That must not read as an outside click.
      const icon = root.querySelector('button i-feather svg') as unknown as HTMLElement;
      icon.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      fixture.detectChanges();
      expect(component.open).toBeTrue();
      expect(root.querySelector('[role="menu"]')).not.toBeNull();
    } finally {
      root.remove();
    }
  });

  it('closes again when the tile is clicked a second time', () => {
    component.items = items;
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    try {
      tile().click();
      fixture.detectChanges();
      expect(component.open).toBeTrue();
      tile().click();
      fixture.detectChanges();
      expect(component.open).toBeFalse();
      expect(root.querySelector('[role="menu"]')).toBeNull();
    } finally {
      root.remove();
    }
  });
});

@Component({
  imports: [LocationsMenuComponent],
  template: `<app-locations-menu [items]="menuItems" [footer]="menuFooter"></app-locations-menu>`
})
class GetterHostComponent {
  built = 0;
  // Mirrors the dashboard trainer/center detail pages, which used to hand the
  // menu a brand-new array on every change-detection pass.
  get menuItems(): LocationMenuItem[] {
    this.built++;
    return [
      { title: 'Vancouver, BC, Canada', href: 'https://maps.example/2' },
      { title: 'Burnaby, Canada', href: 'https://maps.example/3' },
    ];
  }
  get menuFooter() { return { text: 'Or train at a place of your choice' }; }
}

describe('LocationsMenuComponent inside a page that builds its items from getters', () => {
  it('does not trip the dev-mode "changed after checked" guard and survives open/close', () => {
    TestBed.configureTestingModule({ imports: [GetterHostComponent] });
    const host = TestBed.createComponent(GetterHostComponent);
    const root = host.nativeElement as HTMLElement;
    document.body.appendChild(root);
    try {
      expect(() => host.detectChanges()).not.toThrow();
      host.autoDetectChanges(true);
      const tile = root.querySelector('button') as HTMLButtonElement;
      (root.querySelector('button i-feather svg') as unknown as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      expect(() => host.detectChanges()).not.toThrow();
      expect(root.querySelector('[role="menu"]')).not.toBeNull();
      tile.click();
      expect(() => host.detectChanges()).not.toThrow();
      expect(root.querySelector('[role="menu"]')).toBeNull();
    } finally {
      root.remove();
    }
  });
});
