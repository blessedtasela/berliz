import { Component } from '@angular/core';
import { BreadcrumbService } from '../services/breadcrumb.service';

@Component({
  selector: 'app-router-breadcrumb',
  templateUrl: './router-breadcrumb.component.html',
  styleUrls: ['./router-breadcrumb.component.css']
})
export class RouterBreadcrumbComponent {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private breadcrumbServic: BreadcrumbService) { }

  ngOnInit() {
    this.breadcrumbs = this.breadcrumbServic.getBreadcrumbs();
  }
}
