import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Categories } from 'src/app/models/categories.interface';
import { loadActiveCategories } from 'src/app/state/category/category.actions';
import { selectActiveCategories } from 'src/app/state/category/category.selectors';
import { BERLIZ_SERVICES, BerlizService } from '../berliz-services';

/**
 * What Berliz offers: online, hybrid and in-person personal training, gyms and training centers, and the shop to
 * come — each linking to its own detail page. Below them, the Disciplines (Boxing, Yoga, Powerlifting…) people
 * can train in, each with a page of its own.
 */
@Component({
  selector: 'app-services-page',
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './services-page.component.html',
})
export class ServicesPageComponent implements OnInit {
  readonly services: BerlizService[] = BERLIZ_SERVICES;
  disciplines$: Observable<Categories[]>;

  constructor(private store: Store) {
    this.disciplines$ = this.store.select(selectActiveCategories);
  }

  ngOnInit(): void {
    this.store.dispatch(loadActiveCategories());
  }

  trackBySlug(_: number, s: BerlizService): string { return s.slug; }
  trackById(_: number, c: Categories): number { return c.id; }
}
