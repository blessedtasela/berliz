import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addTodo(data: any) {
    return this.httpClient.post(this.url + "/todoList/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllTodos() {
    return this.httpClient.get(this.url + "/todoList/get");
  }

  getmyTodos() {
    return this.httpClient.get(this.url + "/todoList/getMyTodos");
  }

  updateTodoList(data: any) {
    return this.httpClient.put(this.url + "/todoList/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  bulkAction(data: any) {
    return this.httpClient.put(this.url + "/todoList/bulkAction", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any, status: any) {
    return this.httpClient.put(this.url + `/todoList/updateStatus/${id}/${status}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteTodo(id: any) {
    return this.httpClient.delete(this.url + `/todoList/delete/${id}`);
  }

}
