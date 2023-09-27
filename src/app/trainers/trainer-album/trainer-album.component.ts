import { Component, Input } from '@angular/core';
import { TrainerAlbum } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-album',
  templateUrl: './trainer-album.component.html',
  styleUrls: ['./trainer-album.component.css']
})
export class TrainerAlbumComponent {
@Input() trainerPhotoALbum: TrainerAlbum | undefined;

}
