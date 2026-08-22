import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { FilterSummaryComponent } from './filter-summary/filter-summary.component';
import { FilterChipsComponent } from './filter-chips/filter-chips.component';
import { DateRangeDrawerComponent } from './date-range-drawer/date-range-drawer.component';
import { DateJoinedDrawerComponent } from './date-joined-drawer/date-joined-drawer.component';
import { IconsModule } from 'src/app/icons/icons.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    SearchPanelComponent,
    SearchBarComponent,
    FilterSummaryComponent,
    FilterChipsComponent,
    DateRangeDrawerComponent,
    DateJoinedDrawerComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    SearchPanelComponent
  ]
})
export class SearchModule { }
