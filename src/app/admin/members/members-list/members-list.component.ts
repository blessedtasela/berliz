import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Members } from 'src/app/models/members.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { MemberService } from 'src/app/services/member.service';
import { MemberStateService } from 'src/app/services/member-state.service';
import { UpdateMembersModalComponent } from '../update-members-modal/update-members-modal.component';
import { MemberDetailsModalComponent } from '../member-details-modal/member-details-modal.component';

@Component({
  selector: 'app-members-list',
  templateUrl: './members-list.component.html',
  styleUrls: ['./members-list.component.css']
})
export class MembersListComponent {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() membersData: Members[] = [];
  @Input() totalMembers: number = 0;

  constructor(private datePipe: DatePipe,
    private memberService: MemberService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    public memberStateService: MemberStateService) {
  }

  ngOnInit() {
    this.watchGetCategoryFromMap()
    this.watchLikeCategory()
    this.watchUpdateCategory()
    this.watchUpdateStatus()
    this.watchDeleteCategory()
  }

  handleEmitEvent() {
    this.memberStateService.getAllMembers().subscribe((allMembers) => {
      this.ngxService.start()
      this.membersData = allMembers;
      this.totalMembers = this.membersData.length
      this.memberStateService.setAllMembersSubject(this.membersData);
      this.ngxService.stop()
    });
  }


  openUpdateMember(id: number) {
    try {
      const member = this.membersData.find(member => member.id === id);
      if (member) {
        const dialogRef = this.dialog.open(UpdateMembersModalComponent, {
          width: '900px',
          maxHeight: '600px',
          disableClose: true,
          data: {
            memberData: member,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateMembersModalComponent;
        childComponentInstance.onUpdateMemberEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a member');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('member not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check member status", 'error');
    }
  }

  openMemberDetails(id: number) {
    try {
      const member = this.membersData.find(member => member.id === id);
      if (member) {
        const dialogRef = this.dialog.open(MemberDetailsModalComponent, {
          width: '800px',
          panelClass: 'mat-dialog-height',
          data: {
            memberData: member,
          }
        });
      } else {
        this.snackbarService.openSnackBar('member not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check member status", 'error');
    }
  }

  updateMemberStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const member = this.membersData.find(member => member.id === id);
    const message = member?.status === 'false'
      ? 'activate this member?'
      : 'deactivate this member?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.memberService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('member status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating member status');
            }
          })
        })
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
  }

  deleteMember(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this member? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.memberService.deleteMember(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('member deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting member');
            }
          })
        })
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
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchLikeCategory() {
    this.rxStompService.watch('/topic/likeCategory').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      const categoryId = this.membersData.findIndex(member => member.id === receivedCategories.id)
      this.membersData[categoryId] = receivedCategories
    });
  }

  watchUpdateCategory() {
    this.rxStompService.watch('/topic/updateCategory').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      const categoryId = this.membersData.findIndex(member => member.id === receivedCategories.id)
      this.membersData[categoryId] = receivedCategories
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      this.membersData.push(receivedCategories);
    });
  }

  watchUpdateStatus() {
    this.rxStompService.watch('/topic/updateCategoryStatus').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      const categoryId = this.membersData.findIndex(member => member.id === receivedCategories.id)
      this.membersData[categoryId] = receivedCategories
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCategory').subscribe((message) => {
      const receivedCategories: Members = JSON.parse(message.body);
      this.membersData = this.membersData.filter(member => member.id !== receivedCategories.id);
    });
  }

}


