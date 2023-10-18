import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { PartnerStateService } from 'src/app/services/partner-state.service';

@Component({
  selector: 'app-partner',
  templateUrl: './partner.component.html',
  styleUrls: ['./partner.component.css']
})
export class PartnerComponent {
  partnersData: Partners[] = [];
  totalPartners: number = 0;
  partnersLength: number = 0;
  searchComponent: string = 'partner'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    private partnerStateService: PartnerStateService) {
  }

  ngOnInit(): void {
    this.partnerStateService.allPartnersData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.partnersData = cachedData;
        this.totalPartners = cachedData.length
        this.partnersLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.partnerStateService.getAllPartners().subscribe((allPartners) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.partnersData = allPartners;
      this.totalPartners = allPartners.length
      this.partnersLength = allPartners.length
      this.partnerStateService.setAllPartnersSubject(this.partnersData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Partners[]): void {
    this.partnersData = results;
    this.totalPartners = results.length;
  }

}

