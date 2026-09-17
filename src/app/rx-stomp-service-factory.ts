import { isPlatformBrowser } from '@angular/common';
import { RxStompService } from './services/rx-stomp.service';
import { myRxStompConfig } from './my-rx-stomp.config';

// Several public-route components (CategoriesComponent, center-search, ...)
// inject RxStompService for live updates, so this factory runs during
// build-time prerendering too. `.activate()` opens a real WebSocket and its
// `beforeConnect` hook reads `localStorage` -- both nonsensical (and the
// former literally crashing) outside a browser, so only ever connect there.
export function rxStompServiceFactory(platformId: Object) {
    const rxStomp = new RxStompService();
    rxStomp.configure(myRxStompConfig);
    if (isPlatformBrowser(platformId)) {
        rxStomp.activate();
    }
    return rxStomp;
}