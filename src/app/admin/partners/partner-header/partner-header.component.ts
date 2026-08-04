import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partner } from 'src/app/models/partners.interface';
import { AddPartnerModalComponent } from '../add-partner-modal/add-partner-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { Store } from '@ngrx/store';
import { loadPartners } from 'src/app/state/partner/partner.actions';
import { selectPartners } from 'src/app/state/partner/partner.selectors';

@Component({
  selector: 'app-partner-header',
  templateUrl: './partner-header.component.html',
  styleUrls: ['./partner-header.component.css']
})
export class PartnerHeaderComponent {
  @Input() partnersData: Partner[] = [];
  selectedSortOption: string = 'date';
  @Input() partnersLength: number = 0;
  @Input() totalPartners: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
    this.watchDeletePartner()
    this.watchGetPartnerFromMap()
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.store.dispatch(loadPartners());
    this.store.select(selectPartners).subscribe((partnersData) => {
      this.partnersData = partnersData
      this.partnersLength = this.partnersData.length
      this.totalPartners = this.partnersData.length;
      this.ngxService.stop();
    });
  }

  sortPartnersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.partnersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'motivation':
        this.partnersData.sort((a, b) => {
          return a.motivation.localeCompare(b.motivation);
        });
        break;
      case 'id':
        this.partnersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'lastUpdate':
        this.partnersData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default:
        this.partnersData.sort((a, b) => {
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
    this.sortPartnersData();
  }

  openAddPartner() {
    const dialogRef = this.dialog.open(AddPartnerModalComponent, {
      width: '800px',
      height: '600px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddPartnerModalComponent;
    childComponentInstance.onAddPartnerEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without performing any action');
      }
    });
  }

  watchGetPartnerFromMap() {
    this.rxStompService.watch('/topic/getNewsletterFromMap').subscribe((message) => {
      const receivedCategories: Partner = JSON.parse(message.body);
      this.partnersData.push(receivedCategories);
      this.partnersLength = this.partnersData.length;
      this.totalPartners = this.partnersData.length;
    });
  }

  watchDeletePartner() {
    this.rxStompService.watch('/topic/deleteNewsletter').subscribe((message) => {
      const receivedNewsletter: Partner = JSON.parse(message.body);
      this.partnersData = this.partnersData.filter(partners => partners.id !== receivedNewsletter.id);
      this.partnersLength = this.partnersData.length;
      this.totalPartners = this.partnersData.length;
    });
  }
}

