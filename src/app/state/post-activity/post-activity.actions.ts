import { createAction, props } from '@ngrx/store';
import { PostActivityEvent } from '../../models/comment.interface';

/**
 * Fired whenever a PostActivityEvent arrives on the private
 * `/user/queue/postActivity` STOMP queue (someone commented on your post, or
 * mentioned you). No reducer/selector -- nothing in the UI needs to read
 * this as state, it only drives the live browser-notification side effect
 * in PostActivityEffects.
 */
export const receivePostActivity = createAction(
  '[Post Activity] Received',
  props<{ event: PostActivityEvent }>()
);
