import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';
import { Centers } from 'src/app/models/centers.interface';
import { ContactUs } from 'src/app/models/contact-us.model';
import { Partners } from 'src/app/models/partners.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { Users } from 'src/app/models/users.interface';

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
  @Output() searchComponentChange: EventEmitter<string> = new EventEmitter<string>();
  @Input() searchComponent: string = '';

  constructor() {
  }

  ngOnInit(): void {

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

}
