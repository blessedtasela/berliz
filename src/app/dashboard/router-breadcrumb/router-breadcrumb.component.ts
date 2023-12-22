import { Component } from '@angular/core';
import { BreadcrumbService } from 'src/app/services/breadcrumb.service';

@Component({
  selector: 'app-router-breadcrumb',
  templateUrl: './router-breadcrumb.component.html',
  styleUrls: ['./router-breadcrumb.component.css']
})
export class RouterBreadcrumbComponent {
  breadcrumbs: { label: string; url: string }[] = [];

  constructor(private breadcrumbService: BreadcrumbService) { }

  ngOnInit() {
    this.breadcrumbs = this.breadcrumbService.getBreadcrumbs();
  }

}
