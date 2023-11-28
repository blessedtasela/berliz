import { Component, Input } from '@angular/core';
import { Centers } from 'src/app/models/centers.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddCenterModalComponent } from '../add-center-modal/add-center-modal.component';

@Component({
  selector: 'app-center-header',
  templateUrl: './center-header.component.html',
  styleUrls: ['./center-header.component.css']
})
export class CenterHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() centersData: Centers[] = [];
  @Input() totalCenters: number = 0;
  @Input() centersLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    public centerStateService: CenterStateService,
    private rxStompService: RxStompService) { }

  ngOnInit() {
    this.watchDeleteCenter()
    this.watchGetCenterFromMap()
  }

  handleEmitEvent() {
    this.centerStateService.getAllCenters().subscribe((allCenters) => {
      this.ngxService.start()
      this.centersData = allCenters;
      this.totalCenters = this.centersData.length
      this.centersLength = this.centersData.length
      this.centerStateService.setAllCentersSubject(this.centersData);
      this.ngxService.stop()
    });
  }

  sortcentersData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.centersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'motto':
        this.centersData.sort((a, b) => {
          return a.motto.localeCompare(b.motto);
        });
        break;
      case 'name':
        this.centersData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'address':
        this.centersData.sort((a, b) => {
          return a.address.localeCompare(b.address);
        });
        break;
      case 'id':
        this.centersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'partnerId':
        this.centersData.sort((a, b) => {
          return a.partner.id - b.partner.id;
        });
        break;
      case 'likes':
        this.centersData.sort((a, b) => {
          return b.likes - a.likes;
        });
        break;
      default:
        this.centersData.sort((a, b) => {
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
    this.sortcentersData();
  }

  openAddCenter() {
    const dialogRef = this.dialog.open(AddCenterModalComponent, {
      width: '800px',
      height: '600px',
      disableClose: true
    });
    const childComponentInstance = dialogRef.componentInstance as AddCenterModalComponent;

    // Set the event emitter before closing the dialog
    childComponentInstance.onAddCenterEmit.subscribe(() => {
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

  watchDeleteCenter() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCenter: Centers = JSON.parse(message.body);
      this.centersData = this.centersData.filter(center => center.id !== receivedCenter.id);
      this.centersLength = this.centersData.length;
      this.totalCenters = this.centersData.length;
    });
  }

  watchGetCenterFromMap() {
    this.rxStompService.watch('/topic/getCenterFromMap').subscribe((message) => {
      const receivedCategories: Centers = JSON.parse(message.body);
      this.centersData.push(receivedCategories);
      this.centersLength = this.centersData.length;
      this.totalCenters = this.centersData.length;
    });
  }

}

