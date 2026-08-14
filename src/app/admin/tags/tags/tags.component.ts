import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Tags } from 'src/app/models/tags.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { loadTags } from 'src/app/state/tag/tag.actions';
import { selectTags } from 'src/app/state/tag/tag.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

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
  subscriptions: Subscription[] = [];

  readonly selectTags = selectTags;
  readonly tagSearchFields: AdminSearchField<Tags>[] = [
    { value: 'name', label: 'Name', accessor: t => t.name },
    { value: 'id', label: 'Tag id', accessor: t => t.id?.toString() },
    { value: 'description', label: 'Description', accessor: t => t.description },
    { value: 'status', label: 'Status', accessor: t => t.status },
  ];

  constructor(private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.watchUpdateTag()
    this.watchUpdateTagStatus()
    this.watchDeleteTag()
    this.watchGetTagFromMap()
    this.handleEmitEvent()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadTags());
    this.subscriptions.push(
      this.store.select(selectTags).subscribe((allTags) => {
        this.tagsData = allTags;
        this.totalTags = allTags.length
        this.tagsLength = allTags.length
      })
    );
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
