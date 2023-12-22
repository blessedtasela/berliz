import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Members } from 'src/app/models/members.interface';
import { MemberStateService } from 'src/app/services/member-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddMembersModalComponent } from '../add-members-modal/add-members-modal.component';

@Component({
  selector: 'app-members-header',
  templateUrl: './members-header.component.html',
  styleUrls: ['./members-header.component.css']
})
export class MembersHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() membersData: Members[] = [];
  @Input() totalMembers: number = 0;
  @Input() membersLength: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private memberStateService: MemberStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.memberStateService.getAllMembers().subscribe((allMembers) => {
      this.ngxService.start()
      console.log('cached false')
      this.membersData = allMembers;
      this.totalMembers = this.membersData.length
      this.membersLength = this.membersData.length
      this.memberStateService.setAllMembersSubject(this.membersData);
      this.ngxService.stop()
    });
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.membersData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'name':
        this.membersData.sort((a, b) => {
          return a.user.firstname.localeCompare(b.user.firstname);
        });
        break;
      case 'id':
        this.membersData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'category':
        this.membersData.sort((a, b) => {
          const nameA = a.categories[0].name.toLowerCase();
          const nameB = b.categories[0].name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      case 'lastUpdate':
        this.membersData.sort((a, b) => {
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

  openAddCategory() {
    const dialogRef = this.dialog.open(AddMembersModalComponent, {
      width: '800px',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddMembersModalComponent;
    childComponentInstance.onAddMemberEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      this.membersData = this.membersData.filter(category => category.id !== receivedCategories.id);
      this.membersLength = this.membersData.length;
      this.totalMembers = this.membersData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      this.membersData.push(receivedCategories);
      this.membersLength = this.membersData.length;
      this.totalMembers = this.membersData.length
    });
  }
}
