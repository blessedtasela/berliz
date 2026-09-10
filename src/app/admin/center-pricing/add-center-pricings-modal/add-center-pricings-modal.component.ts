import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Centers } from 'src/app/models/centers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CenterService } from 'src/app/services/center.service';
import { selectCenters } from 'src/app/state/center/center.selectors';
import { loadCenters } from 'src/app/state/center/center.actions';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-center-pricings-modal',
  templateUrl: './add-center-pricings-modal.component.html',
  styleUrls: ['./add-center-pricings-modal.component.css']
})
export class AddCenterPricingsModalComponent {
  onAddCenterPricingEmit = new EventEmitter();
  addCenterPricingForm!: FormGroup;
  invalidForm: boolean = false;
  centers: Centers[] = [];
  responseMessage: any;
  selectedCenter!: Centers | null;

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AddCenterPricingsModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private centerService: CenterService) { }

  ngOnInit(): void {
    this.addCenterPricingForm = this.formBuilder.group({
      'centerId': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'price': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount3Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount6Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount9Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount12Months': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      'discount2Programs': ['', Validators.compose([Validators.required, Validators.minLength(1)])],
    });
    this.onEmit();
  }

  onEmit(): void {
    this.store.dispatch(loadCenters());
    this.store.select(selectCenters).subscribe((centers) => {
      this.centers = centers;
    });
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding center pricing');
  }

  onCenterSelected(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedCenter = this.centers.find(center => center.id === +id) || null;
  }

  addCenterPricing(): void {
    if (this.addCenterPricingForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.centerService.addPricing(this.addCenterPricingForm.value)
        .subscribe((response: any) => {
          this.addCenterPricingForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('CenterPricing added successfully');
          this.responseMessage = response?.message;
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
          this.onAddCenterPricingEmit.emit();
        }, (error: any) => {
          this.ngxService.start();
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        });
      this.ngxService.stop();
    }
  }

  clear() {
    this.addCenterPricingForm.reset();
    this.selectedCenter = null;
  }
}
