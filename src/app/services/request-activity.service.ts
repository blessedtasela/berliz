import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * Counts the create/update/delete requests currently in flight. {@link installDoubleSubmitGuard} uses it to stop a
 * form being submitted a second time while its first submit is still being processed (double-click, impatient Enter),
 * which otherwise creates duplicates -- two bookings, two posts, two payments.
 */
@Injectable({ providedIn: 'root' })
export class RequestActivityService {
  private inFlight = 0;
  private idleCallbacks: Array<() => void> = [];

  get busy(): boolean {
    return this.inFlight > 0;
  }

  begin(): void {
    this.inFlight++;
  }

  end(): void {
    this.inFlight = Math.max(0, this.inFlight - 1);
    if (this.inFlight === 0 && this.idleCallbacks.length) {
      const callbacks = this.idleCallbacks;
      this.idleCallbacks = [];
      callbacks.forEach(cb => cb());
    }
  }

  /** Runs `cb` once nothing is in flight (immediately if that is already the case). */
  onIdleOnce(cb: () => void): void {
    if (!this.busy) cb();
    else this.idleCallbacks.push(cb);
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class RequestActivityInterceptor implements HttpInterceptor {
  constructor(private activity: RequestActivityService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // The WebSocket handshake and fire-and-forget analytics pings aren't user submissions.
    if (!MUTATING.has(request.method) || request.url.includes('/stomp') || request.url.includes('/provider-analytics/')) {
      return next.handle(request);
    }
    this.activity.begin();
    return next.handle(request).pipe(finalize(() => this.activity.end()));
  }
}
