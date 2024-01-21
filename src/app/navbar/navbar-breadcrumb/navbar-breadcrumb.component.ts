import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';


@Component({
  selector: 'app-navbar-breadcrumb',
  templateUrl: './navbar-breadcrumb.component.html',
  styleUrls: ['./navbar-breadcrumb.component.css']
})
export class NavbarBreadcrumbComponent {
  @Input() breadcrumbs: { label: string; url: string; }[] = [];;

  constructor(private breadcrumbService: BreadcrumbService,
    private router: Router,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // console.log('RouterBreadcrumbComponent initialized');
    // this.breadcrumbService.getBreadcrumbsObservable().subscribe(breadcrumbs => {
    //   this.breadcrumbs = breadcrumbs;
    // });
    // this.cdr.detectChanges();
  }
}
