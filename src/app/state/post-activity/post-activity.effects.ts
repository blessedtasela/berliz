import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs';
import { RxStompService } from '../../services/rx-stomp.service';
import { BrowserNotificationService } from '../../services/browser-notification.service';
import { PostActivityEvent } from '../../models/comment.interface';
import * as A from './post-activity.actions';

/**
 * Live "someone commented on your post" / "you were mentioned" browser push
 * -- same private-per-user-queue pattern MessageEffects already uses for
 * incoming messages, just against `/user/queue/postActivity` instead of
 * `/user/queue/messages`. Falls under the existing 'post' notification
 * category (Posts & feed activity) in settings, which previously had no
 * live event stream to actually fire from.
 */
@Injectable()
export class PostActivityEffects {

  constructor(
    private actions$: Actions,
    private rxStompService: RxStompService,
    private browserNotifications: BrowserNotificationService,
    private router: Router,
  ) { }

  receivePostActivity$ = createEffect(() => this.rxStompService.watch('/user/queue/postActivity').pipe(
    map(stompMessage => A.receivePostActivity({ event: JSON.parse(stompMessage.body) as PostActivityEvent }))
  ));

  /** Only fires while the page is hidden (see BrowserNotificationService) — no point popping a system alert for something already on screen. */
  notifyOnPostActivity$ = createEffect(() => this.actions$.pipe(
    ofType(A.receivePostActivity),
    tap(({ event }) => {
      const title = event.type === 'mention'
        ? `${event.actorName || 'Someone'} mentioned you`
        : `${event.actorName || 'Someone'} commented on your post`;

      this.browserNotifications.notify(
        'post',
        title,
        event.preview,
        () => this.router.navigate(['/dashboard/timeline']),
      );
    })
  ), { dispatch: false });
}
