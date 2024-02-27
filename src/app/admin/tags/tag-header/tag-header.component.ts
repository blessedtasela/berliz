import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tags } from 'src/app/models/tags.interface';
import { TagStateService } from 'src/app/services/tag-state.service';
import { AddTagModalComponent } from '../add-tag-modal/add-tag-modal.component';
import { RxStompService } from 'src/app/services/rx-stomp.service';

@Component({
  selector: 'app-tag-header',
  templateUrl: './tag-header.component.html',
  styleUrls: ['./tag-header.component.css']
})
export class TagHeaderComponent {
  @Input() tagsData: Tags[] = [];
  selectedSortOption: string = 'date';
  @Input() tagsLength: number = 0;
  @Input() totalTags: number = 0;

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private tagStateService: TagStateService,
    private rxStompService: RxStompService) { }

  ngOnInit(): void {  }

  handleEmitEvent() {
    this.tagStateService.getAllTags().subscribe((tagsData) => {
      this.ngxService.start();
      this.tagsData = tagsData
      this.tagsLength = this.tagsData.length
      this.totalTags = this.tagsData.length;
      this.tagStateService.setAllTagsSubject(this.tagsData);
      this.ngxService.stop();
    });
  }

  sorttagsData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.tagsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;

      case 'name':
        this.tagsData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;

      case 'id':
        this.tagsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;

      default:
        this.tagsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sorttagsData();
  }

  openAddTag() {
    const dialogRef = this.dialog.open(AddTagModalComponent, {
      width: '700px',
      height: '420px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddTagModalComponent;
    childComponentInstance.onAddTagEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a tag');
      }
    });
  }

}

