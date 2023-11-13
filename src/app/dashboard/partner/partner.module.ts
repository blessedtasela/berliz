import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartnerApplicationComponent } from './partner-application/partner-application.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { TrainerComponent } from './trainer/trainer.component';
import { CenterComponent } from './center/center.component';
import { PartnerPageComponent } from './partner-page/partner-page.component';
import { PartnerDataComponent } from './partner-data/partner-data.component';
import { TrainerDataComponent } from './trainer-data/trainer-data.component';
import { CenterDataComponent } from './center-data/center-data.component';
import { NullPartnerComponent } from './null-partner/null-partner.component';



@NgModule({
  declarations: [
    PartnerApplicationComponent,
    TrainerComponent,
    CenterComponent,
    PartnerPageComponent,
    PartnerDataComponent,
    TrainerDataComponent,
    CenterDataComponent,
    NullPartnerComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule,
    NgxExtendedPdfViewerModule
  ]
})
export class PartnerModule { }
