import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainerClients } from 'src/app/models/trainers.interface';
import { selectTrainerClients } from 'src/app/state/trainer/trainer.selector';
import { loadTrainerClients } from 'src/app/state/trainer/trainer.actions';

@Component({
  selector: 'app-my-trainer-clients',
  templateUrl: './my-trainer-clients.component.html',
  styleUrls: ['./my-trainer-clients.component.css']
})
export class MyTrainerClientsComponent {

  trainerClients: TrainerClients[] = [];
  showAll: boolean = false;
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  pageSize: number = 16;

  private subscriptions: Subscription[] = [];

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent(): void {
    this.store.dispatch(loadTrainerClients());
    this.subscriptions.push(
      this.store.select(selectTrainerClients).subscribe(clients => {
        this.trainerClients = clients;
      })
    );
  }

  filteredClients(): TrainerClients[] {
    let result = [...this.trainerClients];

    // if (this.searchTerm.trim()) {
    //   const term = this.searchTerm.toLowerCase();
    //   result = result.filter(c => {
    //     const name = `${c.clients?[0].user?.firstname ?? ''} ${c.client?.user?.lastname ?? ''}`.toLowerCase();
    //     return name.includes(term);
    //   });
    // }

    // result.sort((a, b) => {
    //   const nameA = `${a.client?.user?.firstname ?? ''} ${a.client?.user?.lastname ?? ''}`.toLowerCase();
    //   const nameB = `${b.client?.user?.firstname ?? ''} ${b.client?.user?.lastname ?? ''}`.toLowerCase();
    //   return this.sortOrder === 'asc'
    //     ? nameA.localeCompare(nameB)
    //     : nameB.localeCompare(nameA);
    // });

    return result;
  }

  visibleClients(): TrainerClients[] {
    const all = this.filteredClients();
    return this.showAll ? all : all.slice(0, this.pageSize);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  getProfilePhoto(photo: string): string {
    if (!photo) return 'assets/avatar.png';
    if (photo.startsWith('data:image') || photo.startsWith('http') || photo.startsWith('blob:')) {
      return photo;
    }
    return 'data:image/png;base64,' + photo;
  }
}