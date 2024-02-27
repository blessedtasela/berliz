import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tags } from 'src/app/models/tags.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TagStateService } from 'src/app/services/tag-state.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent {
  tagsData: Tags[] = [];
  totalTags: number = 0;
  tagsLength: number = 0;
  searchComponent: string = 'tag'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    private tagStateService: TagStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchUpdateTag()
    this.watchUpdateTagStatus()
    this.watchDeleteTag()
    this.watchGetTagFromMap()
    this.ngxService.start()
    this.handleEmitEvent()
    this.ngxService.stop()
    // this.tagStateService.allTagsData$.subscribe((cachedData) => {
    //   if (!cachedData) {
    //     this.handleEmitEvent()
    //   } else {
    //     this.tagsData = cachedData;
    //     this.totalTags = cachedData.length
    //     this.tagsLength = cachedData.length
    //   }
    // });
  }

  handleEmitEvent() {
    this.tagStateService.getAllTags().subscribe((allTags) => {
      console.log('isCachedData false')
      this.tagsData = allTags;
      this.totalTags = allTags.length
      this.tagsLength = allTags.length
      this.tagStateService.setAllTagsSubject(this.tagsData);
    });
  }

  handleSearchResults(results: Tags[]): void {
    this.tagsData = results;
    this.totalTags = results.length;
    this.tagsLength = results.length;
  }

  watchUpdateTag() {
    this.rxStompService.watch('/topic/updateTag').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchUpdateTagStatus() {
    this.rxStompService.watch('/topic/updateTagStatus').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchGetTagFromMap() {
    this.rxStompService.watch('/topic/getTagFromMap').subscribe((message) => {
      this.handleEmitEvent()
    });
  }

  watchDeleteTag() {
    this.rxStompService.watch('/topic/deleteTag').subscribe((message) => {
      const receivedNewsletter: Tags = JSON.parse(message.body);
      this.handleEmitEvent()
    });
  }
}

