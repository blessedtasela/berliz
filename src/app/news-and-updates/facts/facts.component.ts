import { Component, OnInit } from '@angular/core';
import { Facts } from '../../models/facts.model';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.css']
})
export class FactsComponent implements OnInit{
fact: Facts[] = [];

  constructor() {
   
  }

  ngOnInit() {
    this.animateCounter();
  }

  animateCounter(){
    this.fact.forEach((fact) => {
      const targetValue = fact.value;
      const interval = setInterval(() => {
        fact.counterValue++;
        if(fact.counterValue >= targetValue) {
          clearInterval(interval);
        }
      }, 1000 / targetValue);
      });
  }

}
