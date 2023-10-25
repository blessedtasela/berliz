import { Component, ElementRef, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { fromEvent, debounceTime, map, tap, switchMap, Observable, catchError, of } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TagService } from 'src/app/services/tag.service';
import { Tags } from 'src/app/models/tags.interface';
import { genericError } from 'src/validators/form-validators.module';
import { UpdateTagModalComponent } from '../update-tag-modal/update-tag-modal.component';
import { AddTagModalComponent } from '../add-tag-modal/add-tag-modal.component';
import { DatePipe } from '@angular/common';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';


@Component({
  selector: 'app-tag-details',
  templateUrl: './tag-details.component.html',
  styleUrls: ['./tag-details.component.css']
})
export class TagDetailsComponent {
  tagData!: Tags;
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TagDetailsComponent>,
    private datePipe: DatePipe) {
    this.tagData = this.data.tagData;
  }

  ngOnInit(): void {

  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}

