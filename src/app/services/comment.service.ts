import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { CommentRequest, CommentResponse } from '../models/comment.interface';

/** Comments on a post — mirrors `CommentRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class CommentService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addComment(request: CommentRequest): Observable<ApiResponse<CommentResponse>> {
    return this.httpClient.post<ApiResponse<CommentResponse>>(this.url + '/comment/add', request);
  }

  deleteComment(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/comment/delete/${id}`);
  }

  /** All comments on a post, oldest first. */
  getComments(postId: number): Observable<ApiResponse<CommentResponse[]>> {
    return this.httpClient.get<ApiResponse<CommentResponse[]>>(this.url + `/comment/post/${postId}`);
  }
}
