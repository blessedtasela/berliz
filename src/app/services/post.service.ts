import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PostRequest, PostResponse } from '../models/post.interface';

/** Timeline/posts — mirrors `PostRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class PostService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addPost(request: PostRequest): Observable<ApiResponse<PostResponse>> {
    return this.httpClient.post<ApiResponse<PostResponse>>(this.url + '/post/add', request);
  }

  updatePost(request: PostRequest): Observable<ApiResponse<PostResponse>> {
    return this.httpClient.put<ApiResponse<PostResponse>>(this.url + '/post/update', request);
  }

  deletePost(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/post/delete/${id}`);
  }

  /** The signed-in user's own posts, newest first. */
  getMyTimeline(): Observable<ApiResponse<PostResponse[]>> {
    return this.httpClient.get<ApiResponse<PostResponse[]>>(this.url + '/post/my-timeline');
  }

  /** One user's own posts, newest first — for viewing someone else's timeline. */
  getUserTimeline(userId: number): Observable<ApiResponse<PostResponse[]>> {
    return this.httpClient.get<ApiResponse<PostResponse[]>>(this.url + `/post/timeline/${userId}`);
  }

  /** The signed-in user's own posts plus their accepted connections' posts. */
  getFeed(): Observable<ApiResponse<PostResponse[]>> {
    return this.httpClient.get<ApiResponse<PostResponse[]>>(this.url + '/post/feed');
  }

  toggleLike(id: number): Observable<ApiResponse<PostResponse>> {
    return this.httpClient.put<ApiResponse<PostResponse>>(this.url + `/post/like/${id}`, {});
  }
}
