import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CenterPricing } from 'src/app/models/centers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectCenterPricing } from 'src/app/state/center/center.selectors';
import { AddCenterPricingsModalComponent } from '../add-center-pricings-modal/add-center-pricings-modal.component';

@Component({
  selector: 'app-center-pricings-header',
  templateUrl: './center-pricings-header.component.html',
  styleUrls: ['./center-pricings-header.component.css']
})
export class CenterPricingsHeaderComponent implements OnInit, OnDestroy {
  selectedSortOption: string = 'date';
  @Input() centerPricingData: CenterPricing[] = [];
  @Input() totalCenterPricing: number = 0;
  @Input() centerPricingLength: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCenterPricing();
    this.watchAddCenterPricing();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.select(selectCenterPricing).subscribe((centerPricing) => {
      this.centerPricingData = centerPricing;
      this.totalCenterPricing = this.centerPricingData.length;
      this.centerPricingLength = this.centerPricingData.length;
    });
  }

  sortCenterPricingData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.centerPricingData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'centerName':
        this.centerPricingData.sort((a, b) => {
          return a.centerName.localeCompare(b.centerName);
        });
        break;
      case 'id':
        this.centerPricingData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.centerPricingData.sort((a, b) => {
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
    this.sortCenterPricingData();
  }

  openAddCenterPricing() {
    const dialogRef = this.dialog.open(AddCenterPricingsModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddCenterPricingsModalComponent;
    childComponentInstance.onAddCenterPricingEmit.subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchDeleteCenterPricing() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/deleteCenterPricing').subscribe((message) => {
        const received: CenterPricing = JSON.parse(message.body);
        this.centerPricingData = this.centerPricingData.filter(cp => cp.id !== received.id);
        this.centerPricingLength = this.centerPricingData.length;
        this.totalCenterPricing = this.centerPricingData.length;
      })
    );
  }

  watchAddCenterPricing() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/addCenterPricing').subscribe((message) => {
        const received: CenterPricing = JSON.parse(message.body);
        this.centerPricingData.push(received);
        this.centerPricingLength = this.centerPricingData.length;
        this.totalCenterPricing = this.centerPricingData.length;
      })
    );
  }
}
