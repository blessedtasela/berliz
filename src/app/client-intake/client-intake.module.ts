import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IconsModule } from '../icons/icons.module';

import { ClientIntakeFormComponent } from './client-intake-form/client-intake-form.component';
import { MyClientIntakesComponent } from './my-client-intakes/my-client-intakes.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
@NgModule({
  declarations: [
    ClientIntakeFormComponent,
    MyClientIntakesComponent
  ],
  imports: [
    LoadErrorComponent,
    ClickablePhotoDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    IconsModule
  ],
  exports: [
    ClientIntakeFormComponent,
    MyClientIntakesComponent
  ]
})
export class ClientIntakeModule { }
