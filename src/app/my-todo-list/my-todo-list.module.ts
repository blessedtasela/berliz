import { NgModule } from '@angular/core';
import { MyTodoListMainComponent } from './my-todo-list-main/my-todo-list-main.component';
import { MyTodoListFormComponent } from './my-todo-list-form/my-todo-list-form.component';
import { MyTodoListsComponent } from './my-todo-lists/my-todo-lists.component';
import { MyTodoListEmptyStateComponent } from './my-todo-list-empty-state/my-todo-list-empty-state.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchModule } from '../shared/search/search.module';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { MyTodoListItemComponent } from './my-todo-list-item/my-todo-list-item.component';;
import { MyTodoListDetailModalComponent } from './my-todo-list-detail-modal/my-todo-list-detail-modal.component';
import { MyTodoListAnalyticChartComponent } from './my-todo-list-analytic-chart/my-todo-list-analytic-chart.component';
import { MyTodoListTimelineComponent } from './my-todo-list-timeline/my-todo-list-timeline.component';
import { MyTodoListHeatmapComponent } from './my-todo-list-heatmap/my-todo-list-heatmap.component';
import { MyTodoListSectionComponent } from './my-todo-list-section/my-todo-list-section.component';
import { MyTodoListHeaderComponent } from './my-todo-list-header/my-todo-list-header.component';
import { DialogModule } from "@angular/cdk/dialog";
import { MyTodoListMetricsComponent } from './my-todo-list-metrics/my-todo-list-metrics.component';
import { SharedModule } from '../shared/shared.module';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    MyTodoListMainComponent,
    MyTodoListFormComponent,
    MyTodoListsComponent,
    MyTodoListEmptyStateComponent,
    MyTodoListItemComponent,
    MyTodoListDetailModalComponent,
    MyTodoListAnalyticChartComponent,
    MyTodoListTimelineComponent,
    MyTodoListHeatmapComponent,
    MyTodoListSectionComponent,
    MyTodoListHeaderComponent,
    MyTodoListMetricsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    IconsModule,
    FeatherModule,
    FormsModule,
    DialogModule,
    SearchModule
  ]
})
export class MyTodoListModule { }
