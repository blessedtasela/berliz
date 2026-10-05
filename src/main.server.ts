import { AppServerModule } from './app/app.server.module';

// Prerendering produces a static HTML snapshot at build time; Angular waits for the app to
// become "stable" before serialising it, and a periodic timer is never done -- so a single
// setInterval left running (the STOMP websocket heartbeat, the landing/about counter
// animations, hero slideshows, ...) makes every route's render hang forever. All of that is
// meaningless in a snapshot, so make periodic timers a no-op in this server-only entry. The
// browser bundle never loads this file, so runtime behaviour is unchanged.
(globalThis as any).setInterval = () => 0;

export { AppServerModule };
// The application builder renders the server entry's DEFAULT export (the older nguniversal
// prerender looked for the named export above) -- keep both.
export default AppServerModule;
