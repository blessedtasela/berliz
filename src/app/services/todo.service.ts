import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs';
import { TodoList } from '../models/todoList.interface';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  url = environment.api;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  // Backend field is `todo`; frontend uses `task` throughout — translated only here.
  private toRequestBody(data: any): any {
    if (data && data.task !== undefined) {
      const { task, ...rest } = data;
      return { ...rest, todo: task };
    }
    return data;
  }

  private toTodoList(raw: any): TodoList {
    const { todo, ...rest } = raw;
    return { ...rest, task: todo };
  }

  addTodo(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/todoList/add", this.toRequestBody(data), {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllTodos() {
    return this.httpClient.get<any[]>(this.url + "/todoList/get").pipe(
      map(list => (list ?? []).map(item => this.toTodoList(item)))
    );
  }

  getmyTodos() {
    return this.httpClient.get<any[]>(this.url + "/todoList/getMyTodos").pipe(
      map(list => (list ?? []).map(item => this.toTodoList(item)))
    );
  }

  updateTodoList(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/todoList/update", this.toRequestBody(data), {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  bulkAction(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/todoList/bulkAction", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  quickAction(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/todoList/quickAction", this.toRequestBody(data), {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any, status: any) {
    return this.httpClient.put<{ message: string }>(this.url + `/todoList/updateStatus/${id}/${status}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteTodo(id: any) {
    return this.httpClient.delete<{ message: string }>(this.url + `/todoList/delete/${id}`);
  }
}
