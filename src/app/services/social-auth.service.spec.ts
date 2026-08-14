import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { SocialAuthService } from './social-auth.service';

describe('SocialAuthService', () => {
  let service: SocialAuthService;
  let originalGoogleClientId: string;
  let originalFacebookAppId: string;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocialAuthService);

    originalGoogleClientId = environment.googleClientId;
    originalFacebookAppId = environment.facebookAppId;

    delete (window as any).google;
    delete (window as any).FB;
    delete (window as any).fbAsyncInit;
  });

  afterEach(() => {
    (environment as any).googleClientId = originalGoogleClientId;
    (environment as any).facebookAppId = originalFacebookAppId;
    delete (window as any).google;
    delete (window as any).FB;
    delete (window as any).fbAsyncInit;

    // Remove any <script> tags this test run injected into <head>, so later specs
    // (or a re-run of this same spec) don't see a stale script from a previous run.
    document.querySelectorAll('script[src*="accounts.google.com"], script[src*="connect.facebook.net"]')
      .forEach(el => el.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isGoogleConfigured / isFacebookConfigured', () => {
    it('is false when the respective environment id is empty', () => {
      (environment as any).googleClientId = '';
      (environment as any).facebookAppId = '';

      expect(service.isGoogleConfigured).toBeFalse();
      expect(service.isFacebookConfigured).toBeFalse();
    });

    it('is true once a real id is configured', () => {
      (environment as any).googleClientId = 'abc123.apps.googleusercontent.com';
      (environment as any).facebookAppId = '1234567890';

      expect(service.isGoogleConfigured).toBeTrue();
      expect(service.isFacebookConfigured).toBeTrue();
    });
  });

  describe('renderGoogleButton', () => {
    it('rejects without touching the DOM when googleClientId is empty', async () => {
      (environment as any).googleClientId = '';

      await expectAsync(service.renderGoogleButton('some-id', () => {})).toBeRejectedWithError(
        'Google Sign-In is not configured yet.'
      );

      // No script should have been injected since we bailed out before loading it.
      expect(document.querySelector('script[src*="accounts.google.com"]')).toBeNull();
    });

    it('initializes GIS and renders the button once configured and the SDK is present', async () => {
      (environment as any).googleClientId = 'abc123.apps.googleusercontent.com';

      const container = document.createElement('div');
      container.id = 'google-button-test-container';
      document.body.appendChild(container);

      const renderButton = jasmine.createSpy('renderButton');
      const initialize = jasmine.createSpy('initialize');
      (window as any).google = { accounts: { id: { initialize, renderButton } } };

      await service.renderGoogleButton('google-button-test-container', () => {});

      expect(initialize).toHaveBeenCalledWith(jasmine.objectContaining({
        client_id: 'abc123.apps.googleusercontent.com',
      }));
      expect(renderButton).toHaveBeenCalledWith(container, jasmine.objectContaining({ type: 'icon' }));

      container.remove();
    });

    it('forwards the ID token from the GIS callback to onCredential', async () => {
      (environment as any).googleClientId = 'abc123.apps.googleusercontent.com';

      const container = document.createElement('div');
      container.id = 'google-button-test-container-2';
      document.body.appendChild(container);

      let capturedCallback: (r: { credential: string }) => void = () => {};
      (window as any).google = {
        accounts: {
          id: {
            initialize: (opts: any) => { capturedCallback = opts.callback; },
            renderButton: () => {},
          },
        },
      };

      const onCredential = jasmine.createSpy('onCredential');
      await service.renderGoogleButton('google-button-test-container-2', onCredential);

      capturedCallback({ credential: 'the-id-token' });
      expect(onCredential).toHaveBeenCalledWith('the-id-token');

      container.remove();
    });
  });

  describe('loginWithFacebook', () => {
    it('rejects without touching the DOM when facebookAppId is empty', async () => {
      (environment as any).facebookAppId = '';

      await expectAsync(service.loginWithFacebook()).toBeRejectedWithError(
        'Facebook Login is not configured yet.'
      );

      expect(document.querySelector('script[src*="connect.facebook.net"]')).toBeNull();
    });

    it('resolves with the access token on a successful FB.login', async () => {
      (environment as any).facebookAppId = '1234567890';

      const login = jasmine.createSpy('login').and.callFake((cb: any) => {
        cb({ authResponse: { accessToken: 'the-access-token' } });
      });
      (window as any).FB = { init: jasmine.createSpy('init'), login };

      const token = await service.loginWithFacebook();

      expect(token).toBe('the-access-token');
      expect(login).toHaveBeenCalledWith(jasmine.any(Function), { scope: 'email,public_profile' });
    });

    it('rejects when the user cancels the Facebook login popup', async () => {
      (environment as any).facebookAppId = '1234567890';

      const login = jasmine.createSpy('login').and.callFake((cb: any) => {
        cb({ authResponse: null });
      });
      (window as any).FB = { init: jasmine.createSpy('init'), login };

      await expectAsync(service.loginWithFacebook()).toBeRejectedWithError(
        'Facebook login was cancelled or not authorized.'
      );
    });
  });
});
