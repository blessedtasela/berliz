import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Trainer } from '../models/trainer.model';

export const TrainerActions = createActionGroup({
  source: 'Trainer/API',
  events: {
    'Load Trainers': props<{ trainers: Trainer[] }>(),
    'Add Trainer': props<{ trainer: Trainer }>(),
    'Upsert Trainer': props<{ trainer: Trainer }>(),
    'Add Trainers': props<{ trainers: Trainer[] }>(),
    'Upsert Trainers': props<{ trainers: Trainer[] }>(),
    'Update Trainer': props<{ trainer: Update<Trainer> }>(),
    'Update Trainers': props<{ trainers: Update<Trainer>[] }>(),
    'Delete Trainer': props<{ id: string }>(),
    'Delete Trainers': props<{ ids: string[] }>(),
    'Clear Trainers': emptyProps(),
  }
});
