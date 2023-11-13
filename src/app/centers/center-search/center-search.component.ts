import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, map, debounceTime, tap, switchMap, distinctUntilChanged, Observable, of, Subscription } from 'rxjs';
import { Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-center-search',
  templateUrl: './center-search.component.html',
  styleUrls: ['./center-search.component.css']
})
export class CenterSearchComponent {
  @Input() centers: Centers[] = [];
  activeCenters: Centers[] = [];
  @Output() allCenters: EventEmitter<Centers[]> = new EventEmitter<Centers[]>();
  searchQuery: string = '';
  selectedSearchCriteria: any = 'name';
  subscription!: Subscription;

  constructor(private centerStateService: CenterStateService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private elementRef: ElementRef,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchUpdateCenterStatus()
  }

  ngAfterViewInit(): void {
    this.initializeSearch();
  }

  ngOnDestroy() {
    if (this.subscription)
      this.subscription.unsubscribe();
  }

  handleEmitEvent() {
    this.subscription = new Subscription();
    this.subscription.add(
      this.centerStateService.getActiveCenters().subscribe((center) => {
        this.initializeSearch();
        this.centers = center
        this.activeCenters = this.centers
        this.centerStateService.setActiveCentersSubject(this.centers);
      })
    )
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
          return this.search(query);
        })
      )
      .subscribe(
        (results: Centers[]) => {
          this.ngxService.stop();
          this.allCenters.emit(results);
        },
        (error: any) => {
          this.snackbarService.openSnackBar(error, 'error');
          this.ngxService.stop();
        }
      );
  }

  onSearchCriteriaChange(event: any): void {
    this.ngxService.start();
    this.selectedSearchCriteria = event.target.value;
    this.search(this.searchQuery);
    this.ngxService.stop()
  }

  search(query: string): Observable<Centers[]> {
    this.centerStateService.activeCentersData$.subscribe((cachedData) => {
      this.activeCenters = cachedData;
    });
    query = query.toLowerCase();
    if (query.trim() === '') {
      this.centers = this.activeCenters;
    }
    this.centers = this.activeCenters.filter((center: Centers) => {
      switch (this.selectedSearchCriteria) {
        case 'name':
          return center.name.toLowerCase().includes(query);
        case 'category':
          return center.categorySet.some(category => category.name.toLowerCase().includes(query));
        case 'address':
          return center.address.toLowerCase().includes(query);
        default:
          return this.activeCenters;
      }
    });
    return of(this.centers);
  }

  watchUpdateCenterStatus() {
    this.rxStompService.watch('/topic/updateCenterStatus').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      if (receivedCenter.status === 'true') {
        this.centers.push(receivedCenter);
      } else {
        this.centers = this.centers.filter(center => center.id !== receivedCenter.id);
      }
    });
  }

}
