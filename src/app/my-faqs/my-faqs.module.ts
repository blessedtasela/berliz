import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyFaqsComponent } from './my-faqs/my-faqs.component';
import { MyFaqsPageComponent } from './my-faqs-page/my-faqs-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FooterModule } from '../footer/footer.module';
import { IconsModule } from '../icons/icons.module';
import { NavbarModule } from '../navbar/navbar.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    MyFaqsComponent,
    MyFaqsPageComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    IconsModule,
    NavbarModule,
    FooterModule,
    FormsModule,
     ReactiveFormsModule
  ]
})
export class MyFaqsModule { }
