import { Injectable } from '@angular/core';
import { RxStompService } from './rx-stomp.service';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  webSocket!: WebSocket;
  stompClient!: any;
  brokerURL = 'ws://localhost:8001/stomp';
  constructor(private rxStompService: RxStompService,
    private snackbarService: SnackBarService) { }

  updateClient() {
    this.rxStompService.watch('/topic/updateClient').subscribe((message) => {
      // Handle the received message here.
      const trainerMessage = message.body;
      this.snackbarService.openSnackBar('Received a trainer like message: ' + trainerMessage, '');
    });
  }

}
