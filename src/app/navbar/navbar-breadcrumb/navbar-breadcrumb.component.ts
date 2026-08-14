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

  /**
   * The full trail rendered on md+ screens where there's room for it.
   * On narrow screens the template hides everything except the last
   * (current-page) crumb via responsive classes, so this stays simple —
   * collapsing only kicks in once the trail is genuinely long, keeping
   * a single "…" in place of the middle segments instead of letting a
   * deep route (Admin > Users > John Doe > Edit > ...) push the search
   * bar and profile controls out of the top bar.
   */
  get displayBreadcrumbs(): Array<{ label: string; url: string; ellipsis?: boolean }> {
    if (this.breadcrumbs.length <= 3) {
      return this.breadcrumbs;
    }
    const first = this.breadcrumbs[0];
    const last = this.breadcrumbs[this.breadcrumbs.length - 1];
    return [first, { label: '…', url: '', ellipsis: true }, last];
  }
}
