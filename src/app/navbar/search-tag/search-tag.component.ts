import { Component, ElementRef, EventEmitter, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, of } from 'rxjs';
import { Tags } from 'src/app/models/tags.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagStateService } from 'src/app/services/tag-state.service';

@Component({
  selector: 'app-search-tag',
  templateUrl: './search-tag.component.html',
  styleUrls: ['./search-tag.component.css']
})
export class SearchTagComponent {
  tagsData: Tags[] = [];
  filteredTagsData: Tags[] = [];
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  @Output() results: EventEmitter<Tags[]> = new EventEmitter<Tags[]>()

  constructor(private tagStateService: TagStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef) {
  }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  initializeSearch(): void {
    fromEvent(this.elementRef.nativeElement.querySelector('input'), 'keyup')
      .pipe(
        debounceTime(300),
        map((e: any) => e.target.value),
        tap(() => {
          this.ngxService.start();
        }),
        switchMap((query: string) => {
          return this.search(query);
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

  onSearchCriteriaChange(event: any): void {
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
  }

  search(query: string): Observable<Tags[]> {
    this.tagStateService.allTagsData$.subscribe((cachedData) => {
      this.tagsData = cachedData;
    })
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.filteredTagsData = this.tagsData;
    }
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
    return of(this.filteredTagsData);
  }

}

