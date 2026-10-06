import { NgModule } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppModule,
    ServerModule,
  ],
  providers: [
    // Server only (the browser keeps the XHR backend AppModule configures). Angular 21's platform-server
    // no longer bundles an XMLHttpRequest implementation, so with the default XHR backend every API call
    // made while prerendering fails silently and data-driven sections (categories, centers, testimonials)
    // render empty. The fetch backend works in Node and its requests are tracked, so the render waits for them.
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
