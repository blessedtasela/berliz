import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TestimonialStateService } from 'src/app/services/testimonial-state.service';
import { AddCategoryModalComponent } from '../../categories/add-category-modal/add-category-modal.component';
import { AddTestimonialsModalComponent } from '../add-testimonials-modal/add-testimonials-modal.component';

@Component({
  selector: 'app-testimonials-header',
  templateUrl: './testimonials-header.component.html',
  styleUrls: ['./testimonials-header.component.css']
})
export class TestimonialsHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() testimonialsData: Testimonials[] = [];
  @Input() totalTestimonials: number = 0;
  @Input() testimonialsLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private testimonialStateService: TestimonialStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.testimonialStateService.getAllTestimonials().subscribe((allTestimonials) => {
      this.ngxService.start()
      console.log('cached false')
      this.testimonialsData = allTestimonials;
      this.totalTestimonials = this.testimonialsData.length
      this.testimonialsLength = this.testimonialsData.length
      this.testimonialStateService.setAllTestimonialsSubject(this.testimonialsData);
      this.ngxService.stop()
    });
  }

  sortTestimonialsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.testimonialsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'email':
        this.testimonialsData.sort((a, b) => {
          return a.user.email.localeCompare(b.user.email);
        });
        break;
      case 'id':
        this.testimonialsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.testimonialsData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortTestimonialsData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddTestimonial() {
    const dialogRef = this.dialog.open(AddTestimonialsModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddTestimonialsModalComponent;
    childComponentInstance.onAddTestimonialEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: Testimonials = JSON.parse(message.body);
      this.testimonialsData = this.testimonialsData.filter(category => category.id !== receivedCategories.id);
      this.testimonialsLength = this.testimonialsData.length;
      this.totalTestimonials = this.testimonialsData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Testimonials = JSON.parse(message.body);
      this.testimonialsData.push(receivedCategories);
      this.testimonialsLength = this.testimonialsData.length;
      this.totalTestimonials = this.testimonialsData.length
    });
  }
}
