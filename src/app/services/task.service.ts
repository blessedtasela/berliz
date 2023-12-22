import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addTask(data: any) {
    return this.httpClient.post(this.url + "/task/add", data);
  }

  addSubTask(data: any) {
    return this.httpClient.post(this.url + "/task/addSubTask", data);
  }

  updateTask(data: any) {
    return this.httpClient.put(this.url + "/task/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateSubTask(data: any) {
    return this.httpClient.put(this.url + "/task/updateSubTask", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/task/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllTasks() {
    return this.httpClient.get(this.url + "/task/get")
  }

  getAllSubTasks() {
    return this.httpClient.get(this.url + "/task/getSubTasks")
  }

  getActiveTasks() {
    return this.httpClient.get(this.url + "/task/getActiveTasks")
  }

  getTrainerTasks() {
    return this.httpClient.get(this.url + "/task/getTrainerTasks")
  }

  getTask() {
    return this.httpClient.get(this.url + "/task/getTask")
  }

  getClientTasks() {
    return this.httpClient.get(this.url + "/task/getClientTasks")
  }

  deleteTask(id: number) {
    return this.httpClient.delete(this.url + `/task/deleteTask/${id}`);
  }

  deleteSubTask(id: number) {
    return this.httpClient.delete(this.url + `/task/deleteSubTask/${id}`);
  }

}