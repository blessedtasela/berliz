import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import 'hammerjs'; 
import { environment } from './environments/environment';
import { initErrorReporting } from './app/services/error-reporting';

initErrorReporting({
  dsn: environment.sentryDsn,
  release: `berliz-web@${environment.appVersion}`,
  environment: environment.production ? 'production' : 'development',
});

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

