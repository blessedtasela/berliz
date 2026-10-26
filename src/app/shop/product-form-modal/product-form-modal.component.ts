import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { Product, ProductClassify, ProductRequest } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { describeUploadError } from 'src/app/utils/media-upload.util';

export interface ProductFormModalData {
  product?: Product;
}

/** List (no `data.product`) or edit (`data.product` set) a single product. Closes with `'saved'` on success. */
@Component({
  selector: 'app-product-form-modal',
  templateUrl: './product-form-modal.component.html',
  styleUrls: ['./product-form-modal.component.css'],
  standalone: false
})
export class ProductFormModalComponent implements OnInit {
  saving = false;
  uploadingPhoto = false;

  form: ProductRequest = {
    name: '',
    description: '',
    classify: 'new',
    price: 0,
    quantity: 1,
    photo: '',
    brandName: '',
  };

  get isEdit(): boolean {
    return !!this.data?.product;
  }

  constructor(
    public dialogRef: MatDialogRef<ProductFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProductFormModalData,
    private productService: ProductService,
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    const product = this.data?.product;
    if (product) {
      this.form = {
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        classify: product.classify,
        price: product.price,
        quantity: product.quantity ?? 0,
        photo: product.photoUrl ?? '',
        brandName: product.brandName ?? '',
      };
    }
  }

  setClassify(classify: ProductClassify): void {
    this.form.classify = classify;
  }

  onPhotoSelected(event: any): void {
    const file: File | undefined = event.target?.files?.[0];
    if (!file) return;
    this.uploadingPhoto = true;
    this.strapiService.uploadToStrapi(file).pipe(take(1)).subscribe({
      next: files => {
        this.uploadingPhoto = false;
        const uploaded = files[0];
        if (uploaded) this.form.photo = uploaded.fullUrl || uploaded.url;
      },
      error: err => {
        this.uploadingPhoto = false;
        this.snackBar.openSnackBar(describeUploadError(err), 'error');
      },
    });
  }

  get isValid(): boolean {
    return !!this.form.name.trim() && this.form.price > 0 && (this.form.classify === 'new' || this.form.classify === 'used');
  }

  save(): void {
    if (!this.isValid || this.saving) return;

    this.saving = true;
    const request: ProductRequest = { ...this.form, name: this.form.name.trim() };
    const call = this.isEdit
      ? this.productService.updateMyProduct(request)
      : this.productService.addMyProduct(request);

    call.subscribe({
      next: res => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.data?.message || (this.isEdit ? 'Listing updated' : 'Listing created'), '');
        this.dialogRef.close('saved');
      },
      error: (err: any) => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not save this listing — try again.', 'error');
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
