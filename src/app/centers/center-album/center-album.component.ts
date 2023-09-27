import { Component, Input } from '@angular/core';
import { CenterAlbum } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-album',
  templateUrl: './center-album.component.html',
  styleUrls: ['./center-album.component.css']
})
export class CenterAlbumComponent {
  @Input() centerAlbum: CenterAlbum | undefined;
}
