import { Injector } from '@angular/core';
import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { ReconnectionTimeMode, StompConfig } from '@stomp/stompjs';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

// RxStompConfig doesn't declare reconnectTimeMode/maxReconnectDelay, but its
// configure() forwards whatever it's given straight to the underlying
// stompjs Client, which does support them -- so we widen the type rather
// than drop the fields.
export const myRxStompConfig: RxStompConfig & Pick<StompConfig, 'reconnectTimeMode' | 'maxReconnectDelay'> = {

  // Which server?
  brokerURL: environment.brokerURL,

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  // First retry waits reconnectDelay; every attempt after that doubles the
  // wait (capped at maxReconnectDelay) so a broker/auth failure that keeps
  // recurring backs off instead of hammering at a fixed interval forever.
  // A successful connect resets the delay back to reconnectDelay.
  reconnectDelay: 5000,
  reconnectTimeMode: ReconnectionTimeMode.EXPONENTIAL,
  maxReconnectDelay: 60000,

  // Skip this key to stop logging to console
  // debug: (msg: string): void => {
  //   console.log(new Date(), msg);
  // },
};

// Runs before every CONNECT attempt (first activation AND every
// auto-reconnect), so it always sends whatever token is currently in
// localStorage rather than one read once at module-load time (which could
// be stale/empty if this module loads before login, or never updated
// across a token refresh). This is what lets the backend's
// StompAuthChannelInterceptor attach a Principal to the session for
// private per-user delivery (convertAndSendToUser) — without it the
// socket connects but stays anonymous, same as before this existed.
/**
 * Connecting with an expired token leaves the socket anonymous, so private messages stop arriving. An idle tab makes
 * no API calls to trigger a refresh, so make one here: any signed-in request that gets a 401 goes through
 * AuthInterceptor's single refresh path. If that fails, connect anyway, because public live updates need no login.
 */
export async function prepareConnect(client: RxStomp, injector: Injector): Promise<void> {
  // Yields first: activate() runs this while RxStompService is still being created, so nothing can be injected yet.
  await Promise.resolve();

  const auth = injector.get(AuthService);
  if (auth.getToken() && !auth.isAuthenticated()) {
    try {
      await firstValueFrom(injector.get(UserService).getUser());
    } catch {
      // AuthInterceptor has already logged the session out if the refresh token was dead.
    }
  }

  const token = auth.getToken();
  client.stompClient.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
}
