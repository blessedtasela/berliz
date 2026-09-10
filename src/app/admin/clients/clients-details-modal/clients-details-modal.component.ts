import { DatePipe } from '@angular/common';
import { memoizePhotoUri, memoizeMediaUri } from 'src/app/shared/photo-lightbox/photo-data-uri';
import { Component, EventEmitter, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Clients } from 'src/app/models/clients.interface';
import { CategoryDetailsModalComponent } from '../../categories/category-details-modal/category-details-modal.component';

@Component({
  selector: 'app-clients-details-modal',
  templateUrl: './clients-details-modal.component.html',
  styleUrls: ['./clients-details-modal.component.css']
})
export class ClientsDetailsModalComponent {
  clientData!: Clients;
  private _photoUri = memoizePhotoUri();
  /** Stable data-URI for the client's base64 profile photo. */
  get photoSrc(): string | null { return this._photoUri(this.clientData?.user?.profilePhoto); }
  responseMessage: any;
  onRejectApplicationEmit = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CategoryDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.clientData = this.data.clientData;
  }

  ngOnInit(): void {
    // console.log(this.clientData)
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
