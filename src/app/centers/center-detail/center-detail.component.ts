import { Component, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CenterPhotoAlbum, CenterAnnouncement, CenterCategory, CenterEquipment, CenterIntroduction, CenterLocation, CenterPromotions, CenterReview, CenterStatistics, CenterSubscriptionForm, CenterTrainers, CenterVideoAlbum } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-detail',
  templateUrl: './center-detail.component.html',
  styleUrls: ['./center-detail.component.css']
})
export class CenterDetailComponent {
  centerId: number = 0;
  centerPromo: CenterPromotions | any;
  centerAnnouncements: CenterAnnouncement[] = [];
  centerAlbums: CenterPhotoAlbum | any;
  centerHeroVideo: CenterVideoAlbum | any;
  centerStatistics: CenterStatistics | any
  centerWhatsapp: CenterSubscriptionForm | any;
  centerIntro: CenterIntroduction | any;
  centerCategory: CenterCategory | any;
  centerEquipment: CenterEquipment[] = [];
  centerTrainer: CenterTrainers | any;
  centerReview: CenterReview| any;
  centerLocation: CenterLocation[] = [];
  onLoading: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private renderer: Renderer2,
    private elementRef: ElementRef,
  ) { }
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');

      if (idParam !== null) {
        this.centerId = +idParam;
        if (isNaN(this.centerId) || this.centerId <= 0) {
          alert('trainer not found');
          console.log("Invalid 'id' parameter: Not a valid positive number");
          this.router.navigate(['/centers']);
        } else {
          // If the 'id' parameter is valid, proceed with fetching the trainer details

        }
      } else {
        alert('missing id parameter');
        console.log("Missing 'id' parameter");
        this.router.navigate(['/centers']);
      }
    });
  }


  scrollToCenterSubscriptionForm() {
    const targetElement = this.elementRef.nativeElement.querySelector('#CenterSubscriptionForm');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.log("Element '#CenterSubscriptionForm' not found.");
    }
  }
}
