import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { TrainerClients } from 'src/app/models/trainers.interface';
import { selectTrainerClients } from 'src/app/state/trainer/trainer.selector';
import { loadTrainerClients } from 'src/app/state/trainer/trainer.actions';

@Component({
    selector: 'app-my-trainer-clients',
    templateUrl: './my-trainer-clients.component.html',
    styleUrls: ['./my-trainer-clients.component.css'],
    standalone: false
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

    const term = this.searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter(c => `${this.clientName(c)} ${c.email ?? ''}`.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      const byName = this.clientName(a).localeCompare(this.clientName(b), undefined, { sensitivity: 'base' });
      return this.sortOrder === 'asc' ? byName : -byName;
    });

    return result;
  }

  visibleClients(): TrainerClients[] {
    const all = this.filteredClients();
    return this.showAll ? all : all.slice(0, this.pageSize);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  clientName(client: TrainerClients): string {
    return `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim() || client.email || 'Client';
  }

  trackByClient = (_: number, client: TrainerClients) => client.id;
}