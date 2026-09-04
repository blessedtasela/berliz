import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestimonialDialogService } from '../testimonial-dialog.service';

@Component({
  selector: 'app-testimonial-hero',
  templateUrl: './testimonial-hero.component.html',
  styleUrls: ['./testimonial-hero.component.css']
})
export class TestimonialHeroComponent implements OnInit {

  constructor(
    private testimonialDialog: TestimonialDialogService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    // A login gate (TestimonialDialogService) sent the user here with
    // ?action=testimonial after signing in -- reopen the form instead of
    // leaving them to find the button again. Strip the param so a manual
    // refresh doesn't reopen it.
    if (this.route.snapshot.queryParamMap.get('action') === 'testimonial') {
      this.openTestimonialForm();
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  openTestimonialForm(): void {
    this.testimonialDialog.openTestimonialForm();
  }
}
