import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddSubscriptionsModalComponent } from '../../subscriptions/add-subscriptions-modal/add-subscriptions-modal.component';
import { AddTrainerPricingModalComponent } from '../add-trainer-pricing-modal/add-trainer-pricing-modal.component';
import { Store } from '@ngrx/store';
import { selectTrainerPricing } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-trainer-pricing-header',
  templateUrl: './trainer-pricing-header.component.html',
  styleUrls: ['./trainer-pricing-header.component.css']
})
export class TrainerPricingHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() trainerPricingData: TrainerPricing[] = [];
  @Input() totalTrainerPricing: number = 0;
  @Input() trainerPricingLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteTrainerPricing()
    this.watchGetTrainerPricingFromMap()
  }

  handleEmitEvent() {
    this.store.select(selectTrainerPricing).subscribe((trainerPricing) => {
      this.trainerPricingData = trainerPricing;
      this.totalTrainerPricing = this.trainerPricingData.length
      this.trainerPricingLength = this.trainerPricingData.length
    });
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.trainerPricingData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'trainerName':
        this.trainerPricingData.sort((a, b) => {
          return a.trainerName.localeCompare(b.trainerName);
        });
        break;
      case 'id':
        this.trainerPricingData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.trainerPricingData.sort((a, b) => {
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
    this.sortCategoriesData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddTrainerPricing() {
    const dialogRef = this.dialog.open(AddTrainerPricingModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddTrainerPricingModalComponent;
    childComponentInstance.onAddTrainerPricingEmit.subscribe(() => {
      // this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a subscription');
      }
    });
  }

  watchDeleteTrainerPricing() {
    this.rxStompService.watch('/topic/deleteTrainerPricing').subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      this.trainerPricingData = this.trainerPricingData.filter(subscription => subscription.id !== receivedCategories.id);
      this.trainerPricingLength = this.trainerPricingData.length;
      this.totalTrainerPricing = this.trainerPricingData.length
    });
  }

  watchGetTrainerPricingFromMap() {
    this.rxStompService.watch('/topic/getTrainerPricingFromMap').subscribe((message) => {
      const receivedCategories: TrainerPricing = JSON.parse(message.body);
      this.trainerPricingData.push(receivedCategories);
      this.trainerPricingLength = this.trainerPricingData.length;
      this.totalTrainerPricing = this.trainerPricingData.length
    });
  }
}
