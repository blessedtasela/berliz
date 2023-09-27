import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventsComponent } from './events/events.component';
import { BlogComponent } from './blog/blog.component';
import { AnnouncementComponent } from './announcement/announcement.component';
import { FactsComponent } from './facts/facts.component';
import { IconsModule } from '../icons/icons.module';



@NgModule({
  declarations: [
    EventsComponent,
    BlogComponent,
    AnnouncementComponent,
    FactsComponent
  ],
  imports: [
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
