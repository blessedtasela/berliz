import { Component, OnInit } from '@angular/core';
import { Categories } from 'src/app/models/categories.interface';
import { CenterCategory, Centers } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-page',
  templateUrl: './center-page.component.html',
  styleUrls: ['./center-page.component.css']
})

export class CenterPageComponent implements OnInit{
  isLoading: boolean = false;
  searchResults: Centers[] = [];
  countResults: number = 0;
  showResult: boolean = false;


  constructor(){}

  ngOnInit(): void {
    
  }
  onLoading(loading: boolean) {
    // Handle the loading state here, if needed
    this.isLoading = loading;
  }

  onResults(results: Centers[]) {
    // Handle the search results here
    this.showResult = true;
    this.searchResults = results;
    // this.countResults = this.centerService.counter;
  }

  }

