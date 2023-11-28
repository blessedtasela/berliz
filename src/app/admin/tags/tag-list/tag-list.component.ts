import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tags } from 'src/app/models/tags.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagStateService } from 'src/app/services/tag-state.service';
import { TagService } from 'src/app/services/tag.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateTagModalComponent } from '../update-tag-modal/update-tag-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TagDetailsModalComponent } from '../tag-details-modal/tag-details-modal.component';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.css']
})
export class TagListComponent {
  responseMessage: any;
  @Input() tagsData: Tags[] = [];
  showFullData: boolean = false;

  constructor(private tagService: TagService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private tagStateService: TagStateService,
    private datePipe: DatePipe,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {
this.watchDeleteTag()
this.watchGetTagFromMap()
this.watchUpdateTag()
this.watchUpdateTagStatus()
  }

  handleEmitEvent() {
    this.tagStateService.getAllTags().subscribe((tagsData) => {
      this.ngxService.start();
      this.tagsData = tagsData
      this.tagStateService.setAllTagsSubject(this.tagsData);
      this.ngxService.stop();
    });
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openUpdateTag(id: number) {
    try {
      const tag = this.tagsData.find(tag => tag.id === id);
      if (tag) {
        const dialogRef = this.dialog.open(UpdateTagModalComponent, {
          width: '700px',
          height: '420px',
          data: {
            tagData: tag,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateTagModalComponent;
        childComponentInstance.onUpdateTagEmit.subscribe(() => {
          this.handleEmitEvent()
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log(`Dialog result: ${result}`);
          } else {
            console.log('Dialog closed without adding a category');
          }
        });
      } else {
        this.snackbarService.openSnackBar('Tag not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check tag status", 'error');
    }
  }

  updateTagStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const tag = this.tagsData.find(tag => tag.id === id);
    const message = tag?.status === 'false'
      ? 'activate this tag?'
      : 'deactivate this tag?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.tagService.updateStatus(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close('Tag status updated successfully')
          this.handleEmitEvent()
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
    });
  }

  openTagDetails(id: number) {
    const tag = this.tagsData.find(tag => tag.id === id);
    if (tag) {
      const dialogRef = this.dialog.open(TagDetailsModalComponent, {
        width: '800px',
        height: '400px',
        data: {
          tagData: tag,
        },
        panelClass: 'mat-dialog-height',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
        } else {
          console.log('Dialog closed without any action');
        }
      });
    }
  }

  deleteTag(id: number) {
    const tag = this.tagsData.find(tag => tag.id === id);
    const dialogConfig = new MatDialogConfig();
    const message = "delete this tag? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.tagService.deleteTag(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          dialogRef.close("Tag deleted successfully")
          this.handleEmitEvent()
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
    });
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchGetTagFromMap() {
    this.rxStompService.watch('/topic/getTagFromMap').subscribe((message) => {
      const receivedCategories: Tags = JSON.parse(message.body);
      this.tagsData.push(receivedCategories);
    });
  }

  watchUpdateTag() {
    this.rxStompService.watch('/topic/updateTag').subscribe((message) => {
      const receivedTags: Tags = JSON.parse(message.body);
      const tagId = this.tagsData.findIndex(tags => tags.id === receivedTags.id)
      this.tagsData[tagId] = receivedTags
    });
  }

  watchUpdateTagStatus() {
    this.rxStompService.watch('/topic/updateTagStatus').subscribe((message) => {
      const receivedTags: Tags = JSON.parse(message.body);
      const tagId = this.tagsData.findIndex(tags => tags.id === receivedTags.id)
      this.tagsData[tagId] = receivedTags
    });
  }

  watchDeleteTag() {
    this.rxStompService.watch('/topic/deleteTag').subscribe((message) => {
      const receivedTags: Tags = JSON.parse(message.body);
      this.tagsData = this.tagsData.filter(tags => tags.id !== receivedTags.id);
    });
  }

}

