import { Component } from '@angular/core';
import { MetaService } from 'src/app/services/meta.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private metaService: MetaService) { }

  ngOnInit() {
    this.metaService.updateMetaTags('dashboard');
  }

}

