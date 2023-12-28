import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Testimonials } from 'src/app/models/testimonials.model';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module'; import { TestimonialService } from 'src/app/services/testimonial.service';
import { TestimonialStateService } from 'src/app/services/testimonial-state.service';
import { UpdateTestimonialsModalComponent } from '../update-testimonials-modal/update-testimonials-modal.component';
import { TestimonialDetailsModalComponent } from '../testimonial-details-modal/testimonial-details-modal.component';

@Component({
  selector: 'app-testimonials-list',
  templateUrl: './testimonials-list.component.html',
  styleUrls: ['./testimonials-list.component.css']
})
export class TestimonialsListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() testimonialsData: Testimonials[] = [];
  @Input() totalTestimonials: number = 0;

  constructor(private datePipe: DatePipe,
    private testimonialService: TestimonialService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public testimonialStateService: TestimonialStateService) {
  }

  ngOnInit() {
    this.watchUpdateStatus()
    this.watchUpdateTestimonial()
  }

  handleEmitEvent() {
    this.testimonialStateService.getAllTestimonials().subscribe((allTestimonials) => {
      this.ngxService.start()
      this.testimonialsData = allTestimonials;
      this.totalTestimonials = this.testimonialsData.length
      this.testimonialStateService.setAllTestimonialsSubject(this.testimonialsData);
      this.ngxService.stop()
    });
  }


  openUpdateTestimonial(id: number) {
    try {
      const testimonial = this.testimonialsData.find(testimonial => testimonial.id === id);
      if (testimonial) {
        const dialogRef = this.dialog.open(UpdateTestimonialsModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            testimonialData: testimonial,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTestimonialsModalComponent;
        childComponentInstance.onUpdateTestimonialEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a testimonial');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('testimonial not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check testimonial status", 'error');
    }
  }

  openTestimonialDetails(id: number) {
    try {
      const testimonial = this.testimonialsData.find(testimonial => testimonial.id === id);
      if (testimonial) {
        const dialogRef = this.dialog.open(TestimonialDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            testimonialData: testimonial,
          }
        });
      } else {
        this.snackbarService.openSnackBar('testimonial not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check testimonial status", 'error');
    }
  }

  updateTestimonialStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const testimonial = this.testimonialsData.find(testimonial => testimonial.id === id);
    const message = testimonial?.status === 'false'
      ? 'activate this testimonial?'
      : 'deactivate this testimonial?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.testimonialService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('testimonial status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating testimonial status');
            }
          });
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  deleteTestimonial(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this testimonial? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.testimonialService.deleteTestimonial(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('testimonial deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting testimonial');
            }
          });
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchUpdateTestimonial() {
    this.rxStompService.watch('/topic/updateTestimonial').subscribe((message) => {
      const receivedCategories: Testimonials = JSON.parse(message.body);
      const categoryId = this.testimonialsData.findIndex(testimonial => testimonial.id === receivedCategories.id)
      this.testimonialsData[categoryId] = receivedCategories
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateTestimonialStatus').subscribe((message) => {
      const receivedCategories: Testimonials = JSON.parse(message.body);
      const categoryId = this.testimonialsData.findIndex(testimonial => testimonial.id === receivedCategories.id)
      this.testimonialsData[categoryId] = receivedCategories
    });
  }

}

