import { Component, OnInit } from '@angular/core';
import { facts } from '../../models/facts.model';

@Component({
  selector: 'app-facts',
  templateUrl: './facts.component.html',
  styleUrls: ['./facts.component.css']
})
export class FactsComponent implements OnInit{
fact: facts[];

  constructor() {
    this.fact = [
      new facts(1, "Our Centers", "../../../assets/landing/gym.png", 507, 0),
      new facts(1, "Our Partners", "../../../assets/landing/trainer.png", 200, 0),
      new facts(1, "Our Members", "../../../assets/landing/member-card.png", 1040, 0),
      new facts(1, "Categories", "../../../assets/landing/iconCategory.png", 12, 0)

    ]
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
