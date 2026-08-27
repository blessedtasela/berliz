import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { environment } from 'src/environments/environment';

export const myRxStompConfig: RxStompConfig = {

  // Which server?
  brokerURL: environment.brokerURL,

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  // Typical value 500 (500 milli seconds)
  reconnectDelay: 5000,

  // Runs before every CONNECT attempt (first activation AND every
  // auto-reconnect), so it always sends whatever token is currently in
  // localStorage rather than one read once at module-load time (which could
  // be stale/empty if this module loads before login, or never updated
  // across a token refresh). This is what lets the backend's
  // StompAuthChannelInterceptor attach a Principal to the session for
  // private per-user delivery (convertAndSendToUser) — without it the
  // socket connects but stays anonymous, same as before this existed.
  beforeConnect: (client) => {
    const token = localStorage.getItem('token');
    client.stompClient.connectHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  },

  // Skip this key to stop logging to console
  // debug: (msg: string): void => {
  //   console.log(new Date(), msg);
  // },
};
