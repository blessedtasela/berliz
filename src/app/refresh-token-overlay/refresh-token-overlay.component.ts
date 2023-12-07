import { Component } from '@angular/core';
import { OverlayService } from '../services/overlay.service';

@Component({
  selector: 'app-refresh-token-overlay',
  templateUrl: './refresh-token-overlay.component.html',
  styleUrls: ['./refresh-token-overlay.component.css']
})
export class RefreshTokenOverlayComponent {
isOverlay$ = this.overlayService.RefreshTokenverlayVisible$;

constructor(private overlayService: OverlayService){

}
}
