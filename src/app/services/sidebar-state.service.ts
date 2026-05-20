import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  private openMenu$ = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this.openMenu$.asObservable();

  setOpen(open: boolean) {
    this.openMenu$.next(open);
  }
}