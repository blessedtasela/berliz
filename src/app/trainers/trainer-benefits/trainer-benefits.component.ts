import { Component, Input } from '@angular/core';
import { TrainerBenefits } from 'src/app/models/trainers.interface';

/**
 * Public read-only rendering of a trainer's benefits.
 * `TrainerBenefits.benefits` is a plain `string[]`.
 */
@Component({
  selector: 'app-trainer-benefits',
  templateUrl: './trainer-benefits.component.html',
  styleUrls: ['./trainer-benefits.component.css']
})
export class TrainerBenefitsComponent {

  @Input() trainerBenefit: TrainerBenefits | null = null;

  get benefits(): string[] {
    return this.trainerBenefit?.benefits ?? [];
  }
}
