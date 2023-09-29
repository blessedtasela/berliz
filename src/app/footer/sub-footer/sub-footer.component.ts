import { Component } from '@angular/core';

@Component({
  selector: 'app-sub-footer',
  templateUrl: './sub-footer.component.html',
  styleUrls: ['./sub-footer.component.css']
})
export class SubFooterComponent {

  constructor() { }
  openBlessedTasela() {
      window.open('https://blessed-tasela.netlify.app/', '_blank');
    
  }
}
