import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

/**
 * Stamps every outgoing request with X-Client-Platform ("web") and
 * X-Client-Version, so the backend's login analytics (see
 * AnalyticsServiceImplement.recordLogin / getLoginStats.platformBreakdown)
 * can tell this web client apart from the native iOS/Android app — which
 * sets the same two headers itself — instead of only ever guessing from the
 * User-Agent. UA-sniffing alone can't reliably distinguish a native app from
 * its mobile-browser counterpart.
 *
 * Deliberately its own interceptor rather than folded into AuthInterceptor:
 * this has nothing to do with auth/token-refresh and every request should
 * carry these headers, public endpoints included.
 */
@Injectable()
export class ClientMetaInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request.clone({
      setHeaders: {
        'X-Client-Platform': 'web',
        'X-Client-Version': environment.appVersion,
      }
    }));
  }
}
