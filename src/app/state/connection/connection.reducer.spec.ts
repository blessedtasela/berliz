import { connectionReducer } from './connection.reducer';
import { initialConnectionState } from './connection.state';
import * as A from './connection.actions';
import { ApiResponse } from '../../models/Api.interface';
import { Connection } from '../../models/connection.model';

describe('Connection Reducer', () => {

  const connection: Connection = {
    id: 1, otherUserId: 5, otherUserName: 'Coach Sam', otherUserRole: 'trainer',
    direction: 'outgoing', status: 'accepted', date: new Date(),
  };

  describe('an unknown action', () => {
    it('returns the previous state', () => {
      const result = connectionReducer(initialConnectionState, {} as any);
      expect(result).toBe(initialConnectionState);
    });
  });

  describe('loadMyConnectionsSuccess', () => {
    it('populates myConnections from the response', () => {
      const response: ApiResponse<Connection[]> = { message: 'ok', data: [connection], success: true, statusCode: 200 };

      const result = connectionReducer(initialConnectionState, A.loadMyConnectionsSuccess({ response }));

      expect(result.myConnections).toEqual([connection]);
      expect(result.loading).toBeFalse();
    });
  });

  describe('loadPendingRequestsSuccess', () => {
    it('populates pendingRequests from the response', () => {
      const pending: Connection = { ...connection, status: 'pending', direction: 'incoming' };
      const response: ApiResponse<Connection[]> = { message: 'ok', data: [pending], success: true, statusCode: 200 };

      const result = connectionReducer(initialConnectionState, A.loadPendingRequestsSuccess({ response }));

      expect(result.pendingRequests).toEqual([pending]);
      expect(result.loading).toBeFalse();
    });
  });

  describe('failures', () => {
    it('sets error and clears loading on any failure action', () => {
      const result = connectionReducer(initialConnectionState, A.sendConnectionRequestFailure({ error: 'nope' }));
      expect(result.error).toBe('nope');
      expect(result.loading).toBeFalse();
    });
  });
});
