import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IconsModule } from '../icons/icons.module';
import { LoadErrorComponent } from '../shared/load-error/load-error.component';

import { ShopBrowseComponent } from './shop-browse/shop-browse.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SellPageComponent } from './sell/sell-page.component';
import { MyStoreComponent } from './sell/my-store/my-store.component';
import { ProductFormModalComponent } from './product-form-modal/product-form-modal.component';

@NgModule({
  declarations: [
    ShopBrowseComponent,
    ProductDetailComponent,
    CartComponent,
    CheckoutComponent,
    SellPageComponent,
    MyStoreComponent,
    ProductFormModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IconsModule,
    LoadErrorComponent,
  ],
})
export class ShopModule { }
