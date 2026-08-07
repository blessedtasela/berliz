import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Members } from 'src/app/models/members.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddMembersModalComponent } from '../add-members-modal/add-members-modal.component';
import { Store } from '@ngrx/store';
import { loadMembers } from 'src/app/state/member/member.actions';
import { selectMembers } from 'src/app/state/member/member.selectors';

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
    public store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteMember()
    this.watchAddMember()
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadMembers());
    this.store.select(selectMembers).subscribe((allMembers) => {
      this.membersData = allMembers;
      this.totalMembers = this.membersData.length
      this.membersLength = this.membersData.length
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
          return a.userFirstname.localeCompare(b.userFirstname);
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
      maxWidth: '95vw',
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

  watchDeleteMember() {
    this.rxStompService.watch('/topic/deleteMember').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchAddMember() {
    this.rxStompService.watch('/topic/addMember').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}
