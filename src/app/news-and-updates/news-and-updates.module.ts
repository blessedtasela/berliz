import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events/events.component';
import { BlogComponent } from './blog/blog.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { FactsComponent } from './facts/facts.component';
import { IconsModule } from '../icons/icons.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    EventsComponent,
    BlogComponent,
    AnnouncementComponent,
    FactsComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    IconsModule
  ],
  exports: [
    FactsComponent,
    BlogComponent,
    AnnouncementComponent,
    EventsComponent
  ]
})
export class NewsAndUpdatesModule { }
