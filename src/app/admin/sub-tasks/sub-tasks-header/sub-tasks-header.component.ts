import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SubTasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AddSubTasksModalComponent } from '../add-sub-tasks-modal/add-sub-tasks-modal.component';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';

@Component({
  selector: 'app-sub-tasks-header',
  templateUrl: './sub-tasks-header.component.html',
  styleUrls: ['./sub-tasks-header.component.css']
})
export class SubTasksHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() subTasksData: SubTasks[] = [];
  @Input() totalSubTasks: number = 0;
  @Input() subTasksLength: number = 0;
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadSubTasks());
    this.subscriptions.push(
      this.store.select(selectSubTasks).subscribe((subTasks) => {
        this.subTasksData = subTasks;
        this.totalSubTasks = this.subTasksData.length
        this.subTasksLength = this.subTasksData.length
        this.ngxService.stop()
      })
    );
  }

  sortCategoriesData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.subTasksData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'name':
        this.subTasksData.sort((a, b) => {
          return a.name.localeCompare(b.name);
        });
        break;
      case 'task':
        this.subTasksData.sort((a, b) => {
          return a.taskId - b.taskId;
        });
        break;
      case 'id':
        this.subTasksData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortCategoriesData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddCategory() {
    const dialogRef = this.dialog.open(AddSubTasksModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddSubTasksModalComponent;
    childComponentInstance.onAddSubTaskEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  watchDeleteCategory() {
    this.rxStompService.watch('/topic/deleteCenter').subscribe((message) => {
      const receivedCategories: SubTasks = JSON.parse(message.body);
      this.subTasksData = this.subTasksData.filter(category => category.id !== receivedCategories.id);
      this.subTasksLength = this.subTasksData.length;
      this.totalSubTasks = this.subTasksData.length
    });
  }

  watchGetCategoryFromMap() {
    this.rxStompService.watch('/topic/getCategoryFromMap').subscribe((message) => {
      const receivedCategories: SubTasks = JSON.parse(message.body);
      this.subTasksData.push(receivedCategories);
      this.subTasksLength = this.subTasksData.length;
      this.totalSubTasks = this.subTasksData.length
    });
  }
}
