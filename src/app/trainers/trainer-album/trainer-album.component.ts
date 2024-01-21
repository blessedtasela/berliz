import { Component, Input } from '@angular/core';
import { TrainerPhotoAlbum } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-album',
  templateUrl: './trainer-album.component.html',
  styleUrls: ['./trainer-album.component.css']
})
export class TrainerAlbumComponent {
@Input() trainerPhotoALbum: TrainerPhotoAlbum | any;

}
