import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'navbar-router-breadcrumb',
  templateUrl: './router-breadcrumb.component.html',
  styleUrls: ['./router-breadcrumb.component.css'],
  host: {
    '[class.app-router-breadcrumb]': 'true', // Add a host attribute to force a different ID
  },
})
export class RouterBreadcrumbComponent {
  breadcrumbs$!: Observable<{ label: string; url: string; }[]>;

  constructor(private breadcrumbService: BreadcrumbService) { }

  ngOnInit() {
    this.breadcrumbs$ = this.breadcrumbService.getBreadcrumbsObservable();
  }

}
