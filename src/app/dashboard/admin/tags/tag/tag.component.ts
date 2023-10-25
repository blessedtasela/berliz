import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Partners } from 'src/app/models/partners.interface';
import { Tags } from 'src/app/models/tags.interface';
import { TagStateService } from 'src/app/services/tag-state.service';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.css']
})
export class TagComponent {
  tagsData: Tags[] = [];
  totalTags: number = 0;
  tagsLength: number = 0;
  searchComponent: string = 'tag'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    private tagStateService: TagStateService) {
  }

  ngOnInit(): void {
    this.tagStateService.allTagsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.tagsData = cachedData;
        this.totalTags = cachedData.length
        this.tagsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.tagStateService.getAllTags().subscribe((allTags) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.tagsData = allTags;
      this.totalTags = allTags.length
      this.tagsLength = allTags.length
      this.tagStateService.setAllTagsSubject(this.tagsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Tags[]): void {
    this.tagsData = results;
    this.totalTags = results.length;
  }

}

