import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { Observable, tap } from 'rxjs';

import { environment } from 'src/environments/environment';
import { resolveReloads } from 'src/app/state/mutation-refresh.rules';
import { AuthService } from './auth.service';

/** Changes that arrive together (a bulk action, a form that saves several things) refresh once, not once each. */
const COALESCE_MS = 150;

/**
 * After any successful create / update / delete, re-fetches the lists that change affects, so the screen shows
 * the result straight away instead of waiting for a WebSocket broadcast (or a manual refresh). See
 * MUTATION_REFRESH_RULES for what refreshes and why.
 */
@Injectable()
export class MutationRefreshInterceptor implements HttpInterceptor, OnDestroy {

  private pending = new Map<string, Action>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(private store: Store, private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse && this.succeeded(event)) {
          this.schedule(request);
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }

  private succeeded(response: HttpResponse<unknown>): boolean {
    if (response.status < 200 || response.status >= 300) return false;
    // The API answers 200 with success:false for some refusals -- nothing changed, so nothing to refresh.
    const body = response.body as { success?: boolean } | null;
    return body?.success !== false;
  }

  private schedule(request: HttpRequest<unknown>): void {
    const path = this.apiPath(request.url);
    if (path === null) return;

    const loaders = resolveReloads(request.method, path, this.authService.getCurrentUserRole());
    if (loaders.length === 0) return;

    for (const load of loaders) {
      const action = load();
      this.pending.set(action.type, action);
    }
    if (this.timer) return;
    this.timer = setTimeout(() => this.flush(), COALESCE_MS);
  }

  private flush(): void {
    this.timer = null;
    const actions = [...this.pending.values()];
    this.pending.clear();
    actions.forEach(action => this.store.dispatch(action));
  }

  /** The path of a request to our own API, or null for anything else (Strapi, third parties). */
  private apiPath(url: string): string | null {
    const base = environment.api;
    if (!url.startsWith(base)) return null;
    const rest = url.slice(base.length);
    const end = rest.search(/[?#]/);
    return end === -1 ? rest : rest.slice(0, end);
  }
}
