import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { take } from 'rxjs';

import { Product } from 'src/app/models/product.model';
import { Store, StoreRequest } from 'src/app/models/store.model';
import { ProductService } from 'src/app/services/product.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StoreService } from 'src/app/services/store.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { describeUploadError } from 'src/app/utils/media-upload.util';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ProductFormModalComponent } from '../../product-form-modal/product-form-modal.component';

/** Approved seller: create the store if it doesn't exist yet, otherwise manage it and its listings. */
@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.css'],
  standalone: false
})
export class MyStoreComponent implements OnChanges, OnInit {
  @Input() store: Store | null = null;
  @Output() storeCreated = new EventEmitter<Store>();

  // Create-store form
  saving = false;
  uploadingPhoto = false;
  form: StoreRequest = { name: '', motto: '', introduction: '', address: '', location: '', photo: '' };

  // Product listings
  products: Product[] = [];
  productsLoaded = false;

  constructor(
    private storeService: StoreService,
    private productService: ProductService,
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    if (this.store) this.fetchProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['store'] && this.store) this.fetchProducts();
  }

  fetchProducts(): void {
    this.productsLoaded = false;
    this.productService.getMyProducts().pipe(take(1)).subscribe({
      next: res => { this.products = res?.data ?? []; this.productsLoaded = true; },
      error: () => { this.products = []; this.productsLoaded = true; },
    });
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

  createStore(): void {
    const name = this.form.name.trim();
    if (!name || this.saving) return;

    this.saving = true;
    this.storeService.createMyStore({ ...this.form, name }).subscribe({
      next: res => {
        this.saving = false;
        if (res?.data) {
          this.snackBar.openSnackBar(res.data.message || 'Your store is live', '');
          this.storeCreated.emit(res.data);
        }
      },
      error: err => {
        this.saving = false;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not create your store — try again.', 'error');
      },
    });
  }

  openAddProduct(): void {
    const dialogRef = this.dialog.open(ProductFormModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.fetchProducts();
    });
  }

  openEditProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormModalComponent, {
      width: '560px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { product },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') this.fetchProducts();
    });
  }

  deleteProduct(product: Product): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: `Remove "${product.name}" from your store? This can't be undone.`,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.productService.deleteMyProduct(product.id).subscribe({
        next: () => {
          this.snackBar.openSnackBar('Listing removed', '');
          this.products = this.products.filter(p => p.id !== product.id);
          dialogRef.close('deleted');
        },
        error: (err: any) => {
          this.snackBar.openSnackBar(err?.error?.message || 'Could not remove that listing.', 'error');
        },
      });
    });
  }
}
