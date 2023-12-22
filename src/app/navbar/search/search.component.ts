import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Tasks } from '../../models/tasks.interface'
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { Clients } from 'src/app/models/clients.interface';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Exercises } from 'src/app/models/exercise.interface';
import { Members } from 'src/app/models/members.interface';
import { MuscleGroups } from 'src/app/models/muscle-groups.interface';
import { Newsletter } from 'src/app/models/newsletter.model';
import { Partners } from 'src/app/models/partners.interface';
import { Payments } from 'src/app/models/payment.interface';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { Tags } from 'src/app/models/tags.interface';
import { SubTasks } from 'src/app/models/tasks.interface';
import { Testimonials } from 'src/app/models/testimonials.model';
import { TodoList } from 'src/app/models/todoList.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  @Output() categoriesResults: EventEmitter<Categories[]> = new EventEmitter<Categories[]>()
  @Output() contactUsResults: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()
  @Output() trainersResults: EventEmitter<Trainers[]> = new EventEmitter<Trainers[]>()
  @Output() usersResults: EventEmitter<Users[]> = new EventEmitter<Users[]>()
  @Output() partnersResults: EventEmitter<Partners[]> = new EventEmitter<Partners[]>()
  @Output() centerssResults: EventEmitter<Centers[]> = new EventEmitter<Centers[]>()
  @Output() newslettersResult: EventEmitter<Newsletter[]> = new EventEmitter<Newsletter[]>();
  @Output() tagsResults: EventEmitter<Tags[]> = new EventEmitter<Tags[]>();
  @Output() myTodoResults: EventEmitter<TodoList[]> = new EventEmitter<TodoList[]>();
  @Output() todoListResults: EventEmitter<TodoList[]> = new EventEmitter<TodoList[]>();
  @Output() muscleGroupResults: EventEmitter<MuscleGroups[]> = new EventEmitter<MuscleGroups[]>();
  @Output() exerciseResults: EventEmitter<Exercises[]> = new EventEmitter<Exercises[]>();
  @Output() clientssResults: EventEmitter<Clients[]> = new EventEmitter<Clients[]>()
  @Output() membersResult: EventEmitter<Members[]> = new EventEmitter<Members[]>();
  @Output() paymentsResults: EventEmitter<Payments[]> = new EventEmitter<Payments[]>();
  @Output() subTasksResults: EventEmitter<SubTasks[]> = new EventEmitter<SubTasks[]>();
  @Output() subscriptionsResults: EventEmitter<Subscriptions[]> = new EventEmitter<Subscriptions[]>();
  @Output() tasksResults: EventEmitter<Tasks[]> = new EventEmitter<Tasks[]>();
  @Output() testimonialsResults: EventEmitter<Testimonials[]> = new EventEmitter<Testimonials[]>();
  @Output() searchComponentChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() searchComponent: string = '';
currentRoute: any;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit(): void {

  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }
  
  handleCategorySearchResults(results: Categories[]): void {
    this.categoriesResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleContactUsSearchResults(results: ContactUs[]): void {
    this.contactUsResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleTrainerSearchResults(results: Trainers[]): void {
    this.trainersResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleUserSearchResults(results: Users[]): void {
    this.usersResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handlePartnerSearchResults(results: Partners[]): void {
    this.partnersResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleCenterSearchResults(results: Centers[]): void {
    this.centerssResults.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleNewsletterSearchResults(results: Newsletter[]): void {
    this.newslettersResult.emit(results)
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleTagSearchResults(results: Tags[]) {
    this.tagsResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleMyTodoSearchResults(results: TodoList[]) {
    this.myTodoResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleTodoListSearchResults(results: TodoList[]) {
    this.todoListResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleMuscleGroupSearchResults(results: MuscleGroups[]) {
    this.muscleGroupResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleExerciseSearchResults(results: Exercises[]) {
    this.exerciseResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleClientSearchResults(results: Clients[]) {
    this.clientssResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleMemberSearchResults(results: Members[]) {
    this.membersResult.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleSubTaskSearchResults(results: SubTasks[]) {
    this.subTasksResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleSubscriptionSearchResults(results: Subscriptions[]) {
    this.subscriptionsResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handlePaymentSearchResults(results: Payments[]) {
    this.paymentsResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleTaskSearchResults(results: Tasks[]) {
    this.tasksResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }

  handleTestimonialSearchResults(results: Testimonials[]) {
    this.testimonialsResults.emit(results);
    this.searchComponentChange.emit(this.searchComponent);
  }
}
