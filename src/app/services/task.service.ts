import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Tasks, SubTasks } from '../models/tasks.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addTask(data: any) {
    return this.httpClient.post<ApiResponse<Tasks>>(this.url + "/task/add", data);
  }

  addSubTask(data: any) {
    return this.httpClient.post<ApiResponse<SubTasks>>(this.url + "/task/addSubTask", data);
  }

  updateTask(data: any) {
    return this.httpClient.put<ApiResponse<Tasks>>(this.url + "/task/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateSubTask(data: any) {
    return this.httpClient.put<ApiResponse<SubTasks>>(this.url + "/task/updateSubTask", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put<ApiResponse<Tasks>>(this.url + `/task/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllTasks() {
    return this.httpClient.get<ApiResponse<Tasks[]>>(this.url + "/task/get")
  }

  getAllSubTasks() {
    return this.httpClient.get<ApiResponse<SubTasks[]>>(this.url + "/task/getSubTasks")
  }

  getActiveTasks() {
    return this.httpClient.get<ApiResponse<Tasks[]>>(this.url + "/task/getActiveTasks")
  }

  getTrainerTasks() {
    return this.httpClient.get<ApiResponse<Tasks[]>>(this.url + "/task/getTrainerTasks")
  }

  getTask(id: number) {
    return this.httpClient.get<ApiResponse<Tasks>>(this.url + `/task/getTask/${id}`)
  }

  getClientTasks() {
    return this.httpClient.get<ApiResponse<Tasks[]>>(this.url + "/task/getClientTasks")
  }

  deleteTask(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/task/delete/${id}`);
  }

  deleteSubTask(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/task/deleteSubTask/${id}`);
  }

}
