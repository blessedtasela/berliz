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
}
