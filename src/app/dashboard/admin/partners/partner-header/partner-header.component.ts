import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { AddPartnerModalComponent } from '../add-partner-modal/add-partner-modal.component';

@Component({
  selector: 'app-partner-header',
  templateUrl: './partner-header.component.html',
  styleUrls: ['./partner-header.component.css']
})
export class PartnerHeaderComponent {
  @Input() partnersData: Partners[] = [];
  selectedSortOption: string = 'date';
  @Input() partnersLength: number = 0;
  @Input() totalPartners: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private partnerStateService: PartnerStateService) { }

  ngOnInit(): void {
 
  }

  handleEmitEvent() {
    this.partnerStateService.getAllPartners().subscribe((partnersData) => {
      this.ngxService.start();
      this.partnersData = partnersData
      this.partnersLength = this.partnersData.length
      this.totalPartners = this.partnersData.length;
      this.partnerStateService.setAllPartnersSubject(this.partnersData);
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

}

