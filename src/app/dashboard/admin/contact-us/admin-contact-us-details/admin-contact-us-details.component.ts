import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { ContactUs } from 'src/app/models/contact-us.model';
import { ContactUsService } from 'src/app/services/contact-us.service';
import { ContactUsFormComponent } from 'src/app/contact-us/contact-us-form/contact-us-form.component';
import { UpdateContactUsModalComponent } from '../update-contact-us-modal/update-contact-us-modal.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-admin-contact-us-details',
  templateUrl: './admin-contact-us-details.component.html',
  styleUrls: ['./admin-contact-us-details.component.css']
})
export class AdminContactUsDetailsComponent {
  contactUsData: ContactUs[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredContactUsData: ContactUs[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalContactUs: number = 0;
  results: EventEmitter<ContactUs[]> = new EventEmitter<ContactUs[]>()

  constructor(private datePipe: DatePipe,
    private contactUsService: ContactUsService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.getAllContactUs().subscribe(() => {
      this.initializeSearch();
      this.filteredContactUsData = this.contactUsData
      this.counter = this.filteredContactUsData.length
      this.totalContactUs = this.contactUsData.length;
    });
  }

  initializeSearch(): void {
    // Your search initialization code here
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap((query: string) => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query); // Perform the search with the query
        })
      )
      .subscribe(
        (results: ContactUs[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  getAllContactUs(): Observable<ContactUs[]> {
    this.ngxService.start();
    return this.contactUsService.getAllContactUs().pipe(
      tap((response: any) => {
        this.contactUsData = response;
        this.ngxService.stop();
      }),
      catchError((error) => {
        this.ngxService.stop();
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  sortContactUsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredContactUsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'name':
        this.filteredContactUsData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'email':
        this.filteredContactUsData.sort((a, b) => {
          return a.email.localeCompare(b.email);
        });
        break;

      case 'id':
        this.filteredContactUsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.filteredContactUsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
    }
  }

  // Function to handle the sort select change event
  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortContactUsData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<ContactUs[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredContactUsData = this.contactUsData;
      this.counter = this.filteredContactUsData.length;
      return of(this.filteredContactUsData);
    }

    // Filter your data based on the selected criteria and search query
    this.filteredContactUsData = this.contactUsData.filter((contactUs: ContactUs) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return contactUs.name.toLowerCase().includes(query);
        case 'email':
          return contactUs.email.toLowerCase().includes(query);
        case 'id':
          return contactUs.id.toString().includes(query);
        case 'message':
          return contactUs.message.toLowerCase().includes(query);
        case 'status':
          return contactUs.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredContactUsData.length;
    return of(this.filteredContactUsData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddContactUs() {
    const dialogRef = this.dialog.open(ContactUsFormComponent, {
      width: '700px'
    });
    const childComponentInstance = dialogRef.componentInstance as ContactUsFormComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onAddContactUsEmit.subscribe(() => {
      this.getAllContactUs().subscribe(() => {
        dialogRef.close('contactUs added successfully')
        this.initializeSearch();
        this.filteredContactUsData = this.contactUsData
        this.counter = this.filteredContactUsData.length
        this.totalContactUs = this.contactUsData.length
      });
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a contactUs');
      }
    });
  }

  openUpdateContactUs(id: number) {
    try {
      const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
      if (contactUs) {
        const dialogRef = this.dialog.open(UpdateContactUsModalComponent, {
          width: '500px',
          data: {
            contactUsData: contactUs,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateContactUsModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateContactUsEmit.subscribe(() => {
          dialogRef.close('ContactUs updated successfully')
          this.getAllContactUs().subscribe(() => {
            this.initializeSearch();
            this.filteredContactUsData = this.contactUsData
            this.counter = this.filteredContactUsData.length
            this.totalContactUs = this.contactUsData.length
          });
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('contactUs not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check contactUs status", 'error');
    }
  }

  updateContactUsStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
    const message = contactUs?.status === 'false'
      ? 'Review this contactUs?'
      : 'make this contactUs pending?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.contactUsService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('ContactUs status updated successfully')
          this.getAllContactUs().subscribe(() => {
            this.initializeSearch();
            this.filteredContactUsData = this.contactUsData
            this.counter = this.filteredContactUsData.length
            this.totalContactUs = this.contactUsData.length
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

  deleteContactUs(id: number) {
    const contactUs = this.contactUsData.find(contactUs => contactUs.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this contactUs? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.contactUsService.deleteContactUs(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('ContactUs deleted successfully')
          this.getAllContactUs().subscribe(() => {
            this.initializeSearch();
            this.filteredContactUsData = this.contactUsData
            this.counter = this.filteredContactUsData.length
            this.totalContactUs = this.contactUsData.length
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

}

