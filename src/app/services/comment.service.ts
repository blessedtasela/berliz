import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { CommentPage, CommentRequest, CommentResponse } from '../models/comment.interface';

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

  updateComment(request: CommentRequest): Observable<ApiResponse<CommentResponse>> {
    return this.httpClient.put<ApiResponse<CommentResponse>>(this.url + '/comment/update', request);
  }

  deleteComment(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/comment/delete/${id}`);
  }

  /** One page of a post's comments, newest first -- page 0 (default) is the most recent `size` (default 10). */
  getComments(postId: number, page = 0, size = 10): Observable<ApiResponse<CommentPage>> {
    return this.httpClient.get<ApiResponse<CommentPage>>(this.url + `/comment/post/${postId}`, {
      params: { page, size },
    });
  }
}
