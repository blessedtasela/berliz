import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { Newsletter } from 'src/app/models/newsletter.model';
import { NewsletterService } from 'src/app/services/newsletter.service';
import { UpdateNewsletterModalComponent } from '../update-newsletter-modal/update-newsletter-modal.component';
import { NewsletterComponent } from 'src/app/footer/newsletter/newsletter.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-newsletter-details',
  templateUrl: './newsletter-details.component.html',
  styleUrls: ['./newsletter-details.component.css']
})
export class NewsletterDetailsComponent {
  newsletterData: Newsletter[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredNewsletterData: Newsletter[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalNewsletters: number = 0;
  results: EventEmitter<Newsletter[]> = new EventEmitter<Newsletter[]>()

  constructor(private datePipe: DatePipe,
    private newsletterService: NewsletterService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    // Call getAllnewsletters to fetch newsletter data
    this.getAllNewsletters().subscribe(() => {
      // Now that newsletter data is available, initialize the search and event listener
      this.initializeSearch();
      this.filteredNewsletterData = this.newsletterData
      this.counter = this.filteredNewsletterData.length
      this.totalNewsletters = this.newsletterData.length;
    });
  }

  initializeSearch(): void {
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
        (results: Newsletter[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  getAllNewsletters(): Observable<Newsletter[]> {
    this.ngxService.start();
    return this.newsletterService.getAllNewsletters().pipe(
      tap((response: any) => {
        this.newsletterData = response;
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

  sortNewsletterData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredNewsletterData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'email':
        this.filteredNewsletterData.sort((a, b) => {
          return a.email.localeCompare(b.email);
        });
        break;

      case 'id':
        this.filteredNewsletterData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.filteredNewsletterData.sort((a, b) => {
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
    this.sortNewsletterData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Newsletter[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredNewsletterData = this.newsletterData;
      this.counter = this.filteredNewsletterData.length;
      return of(this.filteredNewsletterData);
    }

    // Filter your data based on the selected criteria and search query
    this.filteredNewsletterData = this.newsletterData.filter((newsletter: Newsletter) => {
      switch (this.selectedSearchCriteria) {
        case 'email':
          return newsletter.email.toLowerCase().includes(query);
        case 'id':
          return newsletter.id.toString().includes(query);
        case 'status':
          return newsletter.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredNewsletterData.length;
    return of(this.filteredNewsletterData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddNewsletter() {
    const dialogRef = this.dialog.open(NewsletterComponent, {
      width: '500px'
    });
    const childComponentInstance = dialogRef.componentInstance as NewsletterComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onAddNewsletterEmit.subscribe(() => {
      dialogRef.close('Newsletter added successfully')
      this.getAllNewsletters().subscribe(() => {

        // Now that category data is available, initialize the search and event listener
        this.initializeSearch();
        this.filteredNewsletterData = this.newsletterData
        this.counter = this.filteredNewsletterData.length
        this.totalNewsletters = this.newsletterData.length
      });

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a newsletter');
      }
    });
  }

  openUpdateNewsletter(id: number) {
    try {
      const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
      if (newsletter) {
        const dialogRef = this.dialog.open(UpdateNewsletterModalComponent, {
          width: '400px',
          data: {
            newsletterData: newsletter,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateNewsletterModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateNewsletter.subscribe(() => {
          dialogRef.close('Newsletter status updated successfully')
          this.getAllNewsletters().subscribe(() => {
            this.initializeSearch();
            this.filteredNewsletterData = this.newsletterData
            this.counter = this.filteredNewsletterData.length
            this.totalNewsletters = this.newsletterData.length
          });
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without updating newsletter');
          }
        });
      } else {
        this.snackbarService.openSnackBar('newsletter not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check newsletter status", 'error');
    }
  }

  updateNewsletterStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
    const message = newsletter?.status === 'false'
      ? 'activate this newsletter?'
      : 'deactivate this newsletter?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.newsletterService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Newsletter status updated successfully')
          this.getAllNewsletters().subscribe(() => {
            this.initializeSearch();
            this.filteredNewsletterData = this.newsletterData
            this.counter = this.filteredNewsletterData.length
            this.totalNewsletters = this.newsletterData.length
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

  deleteNewsletter(id: number) {
    const newsletter = this.newsletterData.find(newsletter => newsletter.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this newsletter? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.newsletterService.deleteNewsletter(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Newsletter deleted successfully')
          this.getAllNewsletters().subscribe(() => {
            this.initializeSearch();
            this.filteredNewsletterData = this.newsletterData
            this.counter = this.filteredNewsletterData.length
            this.totalNewsletters = this.newsletterData.length
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

