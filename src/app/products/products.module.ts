import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsPageComponent } from './products-page/products-page.component';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ProductHeroComponent } from './product-hero/product-hero.component';
import { ProductHeaderComponent } from './product-header/product-header.component';
import { ProductSearchComponent } from './product-search/product-search.component';
import { ProductSearchResultComponent } from './product-search-result/product-search-result.component';
import { ProductOffersComponent } from './product-offers/product-offers.component';
import { ProductPromotionsComponent } from './product-promotions/product-promotions.component';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductStatisticsComponent } from './product-statistics/product-statistics.component';
import { CartComponent } from './cart/cart.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { CartCheckOutComponent } from './cart-check-out/cart-check-out.component';
import { ChatWithSellerComponent } from './chat-with-seller/chat-with-seller.component';
import { ChatWithSellerPopUpComponent } from './chat-with-seller-pop-up/chat-with-seller-pop-up.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductDetailHeroComponent } from './product-detail-hero/product-detail-hero.component';
import { ProductInfoComponent } from './product-info/product-info.component';
import { ProductDescriptionComponent } from './product-description/product-description.component';
import { RelatedProductsComponent } from './related-products/related-products.component';
import { UsedProductsComponent } from './used-products/used-products.component';
import { NewProductsComponent } from './new-products/new-products.component';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';

export const productChildRoutes: Routes = [
  { path: 'main', component: MainComponent },
  { path: 'new-products', component: NewProductsComponent },
  { path: 'used-products', component: UsedProductsComponent },
];

@NgModule({
  declarations: [
    ProductsPageComponent,
    ProductHeroComponent,
    ProductHeaderComponent,
    ProductSearchComponent,
    ProductSearchResultComponent,
    ProductOffersComponent,
    ProductPromotionsComponent,
    ProductListComponent,
    ProductStatisticsComponent,
    CartComponent,
    CartListComponent,
    CartCheckOutComponent,
    ChatWithSellerComponent,
    ChatWithSellerPopUpComponent,
    ProductDetailComponent,
    ProductDetailHeroComponent,
    ProductInfoComponent,
    ProductDescriptionComponent,
    RelatedProductsComponent,
    UsedProductsComponent,
    NewProductsComponent,
    MainComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(productChildRoutes),
    NavbarModule,
    FooterModule
  ]
})
export class ProductsModule { }
