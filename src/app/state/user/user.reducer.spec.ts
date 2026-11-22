import { userReducer } from './user.reducer';
import { initialUserState } from './user.state';
import * as UserActions from './user.actions';

describe('User Reducer', () => {
  describe('unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = userReducer(initialUserState, action);

      expect(result).toBe(initialUserState);
    });
  });

  // GN-72/73/77/91: loading and usersLoading used to be the SAME flag for two unrelated async
  // operations (the signed-in user's own profile vs. the admin all-users list). Whichever
  // resolved first flipped the shared flag to false for both, so the Users list/widget could
  // briefly read "loading: false" with no users yet and flash "No users yet" -- most visibly
  // right after Return to admin re-triggers an own-profile load that often resolves before the
  // users list does. These lock in that the two tracks can no longer clobber each other.
  describe('usersLoading is independent of loading (GN-72/73/77/91)', () => {
    it('loadAllUsers sets usersLoading without touching loading', () => {
      const state = userReducer({ ...initialUserState, loading: false }, UserActions.loadAllUsers());
      expect(state.usersLoading).toBeTrue();
      expect(state.loading).toBeFalse();
    });

    it('loadUsersSuccess clears usersLoading without touching loading', () => {
      const midState = { ...initialUserState, loading: true, usersLoading: true };
      const state = userReducer(midState, UserActions.loadUsersSuccess({ response: { success: true, message: '', data: [], statusCode: 200 } as any }));
      expect(state.usersLoading).toBeFalse();
      expect(state.loading).toBeTrue();
    });

    it('a concurrent own-profile load finishing does not clear usersLoading out from under an in-flight users-list load', () => {
      let state = userReducer(initialUserState, UserActions.loadAllUsers());
      state = userReducer(state, UserActions.loadUser());
      state = userReducer(state, UserActions.loadUserSuccess({ response: { success: true, message: '', data: null, statusCode: 200 } as any }));

      // The exact bug: the users list is still loading, but a plain `loading` read would say false here.
      expect(state.usersLoading).toBeTrue();
      expect(state.loading).toBeFalse();
    });

    it('loadUser/loadUserSuccess never touch usersLoading', () => {
      let state = userReducer({ ...initialUserState, usersLoading: false }, UserActions.loadUser());
      expect(state.usersLoading).toBeFalse();

      state = userReducer({ ...state, usersLoading: true }, UserActions.loadUserSuccess({ response: { success: true, message: '', data: null, statusCode: 200 } as any }));
      expect(state.usersLoading).toBeTrue();
    });

    it('refreshUsers sets usersLoading, not loading', () => {
      const state = userReducer(initialUserState, UserActions.refreshUsers());
      expect(state.usersLoading).toBeTrue();
      expect(state.loading).toBeFalse();
    });
  });
});
