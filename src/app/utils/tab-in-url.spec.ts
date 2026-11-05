import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TabInUrl, tabInUrl } from './tab-in-url';

type Tab = 'bookings' | 'earnings' | 'insights';
const TABS: readonly Tab[] = ['bookings', 'earnings', 'insights'];

@Component({ template: '', standalone: true })
class HostComponent {
  tabs: TabInUrl<Tab> = tabInUrl(TABS, 'bookings');
}

describe('tabInUrl', () => {
  let router: Router;
  let location: Location;
  let tabs: TabInUrl<Tab>;

  let currentUrl = '/';
  function open(url: string): void {
    currentUrl = url;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    spyOn(location, 'replaceState');
    spyOnProperty(router, 'url', 'get').and.callFake(() => currentUrl);
    tabs = TestBed.createComponent(HostComponent).componentInstance.tabs;
  });

  it('reads the tab named in the address', () => {
    open('/provider-bookings?tab=earnings');
    expect(tabs.fromUrl()).toBe('earnings');
  });

  it('ignores a missing or unknown tab', () => {
    open('/provider-bookings');
    expect(tabs.fromUrl()).toBeNull();
    open('/provider-bookings?tab=bogus');
    expect(tabs.fromUrl()).toBeNull();
  });

  it('writes the tab, keeping the path and the other query params', () => {
    open('/provider-bookings?payoutId=4');
    tabs.remember('insights');
    expect(location.replaceState).toHaveBeenCalledWith('/provider-bookings?payoutId=4&tab=insights');
  });

  it('leaves the address clean for the default tab', () => {
    open('/provider-bookings?tab=earnings');
    tabs.remember('bookings');
    expect(location.replaceState).toHaveBeenCalledWith('/provider-bookings');
  });

  it('takes a per-screen default when the default depends on the user', () => {
    open('/my-sessions');
    tabs.remember('earnings', 'earnings');
    expect(location.replaceState).toHaveBeenCalledWith('/my-sessions');
  });
});
