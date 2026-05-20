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
    this.breadcrumbService.breadcrumbs$.subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs.map((b: any) => ({
        label: b.label,
        url: b.routeLink
      }));
      this.cdr.detectChanges();
    });
  }
}
