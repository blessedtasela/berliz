import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SubTasks } from 'src/app/models/tasks.interface';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { AddSubTasksModalComponent } from '../add-sub-tasks-modal/add-sub-tasks-modal.component';

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

  constructor(private ngxService: NgxUiLoaderService,
    private dialog: MatDialog,
    private taskStateService: TaskStateService,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteCategory()
    this.watchGetCategoryFromMap()
  }

  handleEmitEvent() {
    this.taskStateService.getSubTasks().subscribe((subTasks) => {
      this.ngxService.start()
      console.log('cached false')
      this.subTasksData = subTasks;
      this.totalSubTasks = this.subTasksData.length
      this.subTasksLength = this.subTasksData.length
      this.taskStateService.setSubTasksSubject(this.subTasksData);
      this.ngxService.stop()
    });
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
            return a.task.description.localeCompare(b.task.description);
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
