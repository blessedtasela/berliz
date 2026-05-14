import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-section',
  templateUrl: './my-todo-list-section.component.html',
  styleUrls: ['./my-todo-list-section.component.css']
})
export class MyTodoListSectionComponent {

  @Input() label!: string;
  @Input() items: TodoList[] = [];
  @Input() searchQuery = '';
  @Input() selectionMode = false;

  @Output() openTodo = new EventEmitter<TodoList>();
  @Output() toggleTodo = new EventEmitter<TodoList>();
  @Output() editTodo = new EventEmitter<TodoList>();
  @Output() deleteTodo = new EventEmitter<TodoList>();
  @Output() quickAction  = new EventEmitter<{ action: string; id: number }>();
}