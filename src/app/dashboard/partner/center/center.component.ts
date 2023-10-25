import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Centers } from 'src/app/models/centers.interface';
import { Users } from 'src/app/models/users.interface';
import { CenterStateService } from 'src/app/services/center-state.service';
import { Partners } from 'src/app/models/partners.interface';
import { Subscription } from 'rxjs';
import { PartnerStateService } from 'src/app/services/partner-state.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fileValidator, genericError } from 'src/validators/form-validators.module';
import { CenterService } from 'src/app/services/center.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UpdateCentersComponent } from '../../admin/centers/update-centers/update-centers.component';
@Component({
  selector: 'app-center',
  templateUrl: './center.component.html',
  styleUrls: ['./center.component.css']
})
export class CenterComponent {
  @Input() centerData!: Centers;
  @Input() user!: Users;
  @Input() partnerData!: Partners;
  subscriptions: Subscription[] = [];
  responseMessage: any;
  invalidForm: boolean = false;
  selectedImage: any;
  updateCenterPhotoForm!: FormGroup;

  constructor(
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private centerStateService: CenterStateService,
    private partnerStateService: PartnerStateService,
    private datePipe: DatePipe,
    private formbuilder: FormBuilder,
    private centerService: CenterService,
    private snackBarService: SnackBarService,) { }

  ngOnInit(): void {
    this.updateCenterPhotoForm = this.formbuilder.group({
      'photo': ['', [Validators.required, fileValidator]],
      'id': [this.centerData.id],
    })
  }

  handleEmitEvent() {
    this.ngxService.start();
    this.subscriptions.push(
      this.centerStateService.getCenter().subscribe((center) => {
        this.centerData = center;
        this.centerStateService.setCenterSubject(center)
      }),
      this.partnerStateService.getPartner().subscribe((partner) => {
        this.partnerData = partner;
        this.partnerStateService.setPartnerSubject(partner);
      })
    );
    this.ngxService.stop();
  }

  emitData(): void {
    this.handleEmitEvent()
    console.log('data emitted: ')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openUpdateCenter() {
    const dialogRef = this.dialog.open(UpdateCentersComponent, {
      width: '800px',
      data: {
        centerData: this.centerData,
      },
      panelClass: 'mat-dialog-height',
    });
    const childComponentInstance = dialogRef.componentInstance as UpdateCentersComponent;
    childComponentInstance.onUpdateCenterEmit.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without updating partner');
      }
    });
  }

  onImgSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    console.log("onSelectedImage", this.selectedImage)
    this.submitForm()
  }

  submitForm(): void {
    this.ngxService.start();
    const requestData = new FormData();
    requestData.append('id', this.updateCenterPhotoForm.get('id')?.value);
    requestData.append('photo', this.selectedImage);
    this.centerService.updatePhoto(requestData)
      .subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.handleEmitEvent()
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, 'error');
        });
    this.snackBarService.openSnackBar(this.responseMessage, "error");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

}
