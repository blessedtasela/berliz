import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
const token = localStorage.getItem('token');

export const myRxStompConfig: RxStompConfig = {
  
  // Which server?
  brokerURL: 'ws://localhost:8001/stomp',

  // How often to heartbeat?
  // Interval in milliseconds, set to 0 to disable
  heartbeatIncoming: 0, // Typical value 0 - disabled
  heartbeatOutgoing: 20000, // Typical value 20000 - every 20 seconds

  // Typical value 500 (500 milli seconds)
  reconnectDelay: 5000,

  // Skip this key to stop logging to console
  // debug: (msg: string): void => {
  //   console.log(new Date(), msg);
  // },
};
