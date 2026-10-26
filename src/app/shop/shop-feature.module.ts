import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ShopModule } from './shop.module';
import { ShopBrowseComponent } from './shop-browse/shop-browse.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { SellPageComponent } from './sell/sell-page.component';
import { AuthGuard } from '../services/auth.guard';

// Lazy-loading wrapper mounted at `/shop` from app-routing.module.ts. Buying and
// selling both require sign-in (AuthGuard); browsing a listing does not.
const routes: Routes = [
  { path: '', component: ShopBrowseComponent, data: { breadcrumb: 'Shop' } },
  { path: 'sell', component: SellPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Sell' } },
  { path: 'cart', component: CartComponent, data: { breadcrumb: 'Cart' } },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Checkout' } },
  { path: ':id', component: ProductDetailComponent, data: { breadcrumb: 'Product' } },
];

@NgModule({
  imports: [
    ShopModule,
    RouterModule.forChild(routes),
  ]
})
export class ShopFeatureModule { }
