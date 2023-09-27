import { Component, Input } from '@angular/core';
import { CenterIntroduction } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-introduction',
  templateUrl: './center-introduction.component.html',
  styleUrls: ['./center-introduction.component.css']
})
export class CenterIntroductionComponent {
@Input() centerIntroduction: CenterIntroduction | undefined;
}
