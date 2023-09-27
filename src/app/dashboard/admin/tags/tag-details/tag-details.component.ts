import { Component, ElementRef, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { Tags } from 'src/app/models/tags.interface';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateTagModalComponent } from '../update-tag-modal/update-tag-modal.component';
import { AddTagModalComponent } from '../add-tag-modal/add-tag-modal.component';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';


@Component({
  selector: 'app-tag-details',
  templateUrl: './tag-details.component.html',
  styleUrls: ['./tag-details.component.css']
})
export class TagDetailsComponent {
  tagsData: Tags[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  invalidForm: boolean = false;
  selectedSortOption: string = 'date';
  filteredTagsData: Tags[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  counter: number = 0;
  totalTags: number = 0;
  results: EventEmitter<Tags[]> = new EventEmitter<Tags[]>()

  constructor(private datePipe: DatePipe,
    private tagService: TagService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    // Call getAlltags to fetch tag data
    this.getAlltags().subscribe(() => {
      // Now that tag data is available, initialize the search and event listener
      this.initializeSearch();
      this.filteredTagsData = this.tagsData
      this.counter = this.filteredTagsData.length
      this.totalTags = this.tagsData.length
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
        (results: Tags[]) => {
          this.ngxService.stop();
          this.results.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  getAlltags(): Observable<Tags[]> {
    this.ngxService.start();
    return this.tagService.getAllTags().pipe(
      tap((response: any) => {
        this.tagsData = response;
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

  sortTagsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.filteredTagsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'name':
        this.filteredTagsData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'id':
        this.filteredTagsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.filteredTagsData.sort((a, b) => {
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
    this.sortTagsData();
  }

  // Function to handle the search select change event
  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Tags[]> {
    query = query.toLowerCase();
    if (query.trim() === '') {
      // If the query is empty, return the original data
      this.filteredTagsData = this.tagsData;
      this.counter = this.filteredTagsData.length;
      return of(this.filteredTagsData);
    }

    // Filter your data based on the selected criteria and search query
    this.filteredTagsData = this.tagsData.filter((tag: Tags) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return tag.name.toLowerCase().includes(query);
        case 'id':
          return tag.id.toString().includes(query);
        case 'description':
          return tag.description.toLowerCase().includes(query);
        case 'status':
          return tag.status.toLowerCase().includes(query);
        default:
          return false;
      }
    });
    this.counter = this.filteredTagsData.length;
    return of(this.filteredTagsData);
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddTag() {
    const dialogRef = this.dialog.open(AddTagModalComponent, {
      width: '500px'
    });
    const childComponentInstance = dialogRef.componentInstance as AddTagModalComponent;

    // Set the event emitter before opening the dialog
    childComponentInstance.onAddTagEmit.subscribe(() => {
      this.getAlltags().subscribe(() => {
        this.initializeSearch();
        this.filteredTagsData = this.tagsData
        this.counter = this.filteredTagsData.length
        this.totalTags = this.tagsData.length
      });

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a tag');
      }
    });
  }

  openUpdateTag(id: number) {
    try {
      const tag = this.tagsData.find(tag => tag.id === id);
      if (tag) {
        const dialogRef = this.dialog.open(UpdateTagModalComponent, {
          width: '500px',
          data: {
            tagData: tag,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTagModalComponent;

        // Set the event emitter before opening the dialog
        childComponentInstance.onUpdateTagEmit.subscribe(() => {
          this.getAlltags().subscribe(() => {
            this.initializeSearch();
            this.filteredTagsData = this.tagsData
            this.counter = this.filteredTagsData.length
            this.totalTags = this.tagsData.length
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
        this.snackbarService.openSnackBar('Tag not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check tag status", 'error');
    }
  }

  updateTagStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const tag = this.tagsData.find(tag => tag.id === id);
    const message = tag?.status === 'false'
      ? 'activate this tag?'
      : 'deactivate this tag?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.tagService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Tag status updated successfully')
          this.getAlltags().subscribe(() => {
            this.initializeSearch();
            this.filteredTagsData = this.tagsData
            this.counter = this.filteredTagsData.length
            this.totalTags = this.tagsData.length
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

  deletetag(id: number) {
    const tag = this.tagsData.find(tag => tag.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this tag? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.tagService.deleteTag(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close("Tag deleted successfully")
          this.getAlltags().subscribe(() => {
            this.initializeSearch();
            this.filteredTagsData = this.tagsData
            this.counter = this.filteredTagsData.length
            this.totalTags = this.tagsData.length
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

