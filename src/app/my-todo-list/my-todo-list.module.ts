import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTodoListMainComponent } from './my-todo-list-main/my-todo-list-main.component';
import { MyTodoListFormComponent } from './my-todo-list-form/my-todo-list-form.component';
import { MyTodoListsComponent } from './my-todo-lists/my-todo-lists.component';
import { MyTodoListPageComponent } from './my-todo-list-page/my-todo-list-page.component';
import { MyTodoListEmptyStateComponent } from './my-todo-list-empty-state/my-todo-list-empty-state.component';
import { MyTodoListRowComponent } from './my-todo-list-row/my-todo-list-row.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchModule } from '../shared/search/search.module';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { MyTodoListItemComponent } from './my-todo-list-item/my-todo-list-item.component';
import { MyTodoListFormEditModalComponent } from './my-todo-list-form-edit-modal/my-todo-list-form-edit-modal.component';
import { MyTodoListDetailModalComponent } from './my-todo-list-detail-modal/my-todo-list-detail-modal.component';
import { MyTodoListAnalyticChartComponent } from './my-todo-list-analytic-chart/my-todo-list-analytic-chart.component';
import { MyTodoListTimelineComponent } from './my-todo-list-timeline/my-todo-list-timeline.component';
import { MyTodoListHeatmapComponent } from './my-todo-list-heatmap/my-todo-list-heatmap.component';


@NgModule({
  declarations: [
    MyTodoListMainComponent,
    MyTodoListFormComponent,
    MyTodoListsComponent,
    MyTodoListPageComponent,
    MyTodoListEmptyStateComponent,
    MyTodoListRowComponent,
    MyTodoListItemComponent,
    MyTodoListFormEditModalComponent,
    MyTodoListDetailModalComponent,
    MyTodoListAnalyticChartComponent,
    MyTodoListTimelineComponent,
    MyTodoListHeatmapComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SearchModule,
    IconsModule,
    FeatherModule
  ]
})
export class MyTodoListModule { }
