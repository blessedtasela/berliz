import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainersModule } from './trainers.module';
import { TrainersMainComponent } from './trainers-main/trainers-main.component';
import { TrainersDetailsComponent } from './trainers-details/trainers-details.component';
import { TrainerGuard } from '../guards/trainer.guard';

// Lazy-loading wrapper for `trainers` and `trainers/:name`, mounted under the
// `trainers` path segment from app-routing.module.ts.
const routes: Routes = [
  { path: '', component: TrainersMainComponent, data: { breadcrumb: 'Trainers' } },
  { path: ':name', component: TrainersDetailsComponent, canActivate: [TrainerGuard], data: { breadcrumb: { alias: 'trainerName' } } },
];

@NgModule({
  imports: [
    TrainersModule,
    RouterModule.forChild(routes),
  ]
})
export class TrainersFeatureModule { }
