import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { RxStompService } from './rx-stomp.service';

/**
 * The socket opens once at app start, and its identity is fixed by the token sent on CONNECT. Without this, a
 * logged-out tab kept receiving that user's private messages, and a fresh login missed them, until the next reconnect.
 * Compares the user rather than the token, so a routine token refresh doesn't drop the connection.
 */
@Injectable({ providedIn: 'root' })
export class StompSessionService {

  private connectedAs: string | null = null;
  private restart: Promise<void> = Promise.resolve();

  constructor(
    private rxStomp: RxStompService,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  start(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.connectedAs = this.authService.getCurrentUserEmail();

    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => this.sync());
    // A login or logout in another tab shares this tab's localStorage. A null key means storage was cleared.
    window.addEventListener('storage', event => {
      if (event.key === 'token' || event.key === null) this.sync();
    });
  }

  private sync(): void {
    const current = this.authService.getCurrentUserEmail();
    if (current === this.connectedAs) return;
    this.connectedAs = current;

    // Chained so a quick logout and login can't call activate() while the old socket is still closing.
    this.restart = this.restart
      .then(() => this.rxStomp.deactivate({ force: true }))
      .then(() => this.rxStomp.activate())
      .catch(err => console.error('Could not restart the live connection', err));
  }
}
