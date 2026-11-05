import { Injector } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { of, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { prepareConnect } from './my-rx-stomp.config';

describe('prepareConnect', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let users: jasmine.SpyObj<UserService>;
  let client: { stompClient: { connectHeaders: Record<string, string> } };
  let injector: Injector;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['getToken', 'isAuthenticated']);
    users = jasmine.createSpyObj('UserService', ['getUser']);
    users.getUser.and.returnValue(of({} as any));
    client = { stompClient: { connectHeaders: {} } };
    injector = Injector.create({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: UserService, useValue: users },
      ],
    });
  });

  const run = () => prepareConnect(client as unknown as RxStomp, injector);

  it('connects with a valid token without any API call', async () => {
    auth.getToken.and.returnValue('valid');
    auth.isAuthenticated.and.returnValue(true);

    await run();

    expect(users.getUser).not.toHaveBeenCalled();
    expect(client.stompClient.connectHeaders).toEqual({ Authorization: 'Bearer valid' });
  });

  it('refreshes an expired token first, then sends the new one', async () => {
    auth.getToken.and.returnValue('expired');
    auth.isAuthenticated.and.returnValue(false);
    users.getUser.and.callFake(() => {
      auth.getToken.and.returnValue('fresh');
      return of({} as any);
    });

    await run();

    expect(users.getUser).toHaveBeenCalledTimes(1);
    expect(client.stompClient.connectHeaders).toEqual({ Authorization: 'Bearer fresh' });
  });

  it('still connects, anonymously, when the refresh fails and the session was logged out', async () => {
    auth.getToken.and.returnValue('expired');
    auth.isAuthenticated.and.returnValue(false);
    users.getUser.and.callFake(() => {
      auth.getToken.and.returnValue(null);
      return throwError(() => new Error('refresh failed'));
    });

    await expectAsync(run()).toBeResolved();

    expect(client.stompClient.connectHeaders).toEqual({});
  });

  it('makes no API call and sends no header for a logged-out visitor', async () => {
    auth.getToken.and.returnValue(null);
    auth.isAuthenticated.and.returnValue(false);

    await run();

    expect(users.getUser).not.toHaveBeenCalled();
    expect(client.stompClient.connectHeaders).toEqual({});
  });

  it('treats a malformed token like an expired one', async () => {
    auth.getToken.and.returnValue('undefined');
    auth.isAuthenticated.and.returnValue(false);

    await run();

    expect(users.getUser).toHaveBeenCalledTimes(1);
  });
});
