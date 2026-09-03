import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ConversationSummary, Message, MessageRequest } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  send(request: MessageRequest) {
    return this.httpClient.post<ApiResponse<Message>>(this.url + "/message/send", request, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getConversations() {
    return this.httpClient.get<ApiResponse<ConversationSummary[]>>(this.url + "/message/conversations");
  }

  getConversation(otherUserId: number) {
    return this.httpClient.get<ApiResponse<Message[]>>(this.url + "/message/conversation/" + otherUserId);
  }

  markConversationRead(otherUserId: number) {
    return this.httpClient.post<ApiResponse<string>>(this.url + "/message/conversation/" + otherUserId + "/read", {});
  }

  /** Edits a message the caller sent, within a short window of sending it (server-enforced). */
  editMessage(messageId: number, request: MessageRequest) {
    return this.httpClient.put<ApiResponse<Message>>(this.url + "/message/" + messageId, request, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** "Unsends" (soft-deletes) a message the caller sent. */
  deleteMessage(messageId: number) {
    return this.httpClient.delete<ApiResponse<Message>>(this.url + "/message/" + messageId);
  }

  /** Relays a transient "typing"/"stopped typing" signal to the other user. Fire-and-forget. */
  setTyping(otherUserId: number, typing: boolean) {
    return this.httpClient.post<ApiResponse<string>>(
      this.url + "/message/conversation/" + otherUserId + "/typing?typing=" + typing, {}
    );
  }
}
