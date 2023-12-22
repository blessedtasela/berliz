import { Injectable } from '@angular/core';
import { Clients } from '../models/clients.interface';
import { ClientService } from './client.service';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class ClientStateService {
  private activeClientsSubject = new BehaviorSubject<any>(null);
  public activeClientsData$: Observable<Clients[]> = this.activeClientsSubject.asObservable();
  private allClientsSubject = new BehaviorSubject<any>(null);
  public allClientsData$: Observable<Clients[]> = this.allClientsSubject.asObservable();
  private clientSubject = new BehaviorSubject<any>(null);
  public clientData$: Observable<Clients> = this.clientSubject.asObservable();
  responseMessage: any;



  constructor(private clientService: ClientService,
    private snackbarService: SnackBarService) { }

  setClientSubject(data: Clients) {
    this.clientSubject.next(data);
  }

  setActiveClientsSubject(data: Clients[]) {
    this.activeClientsSubject.next(data);
  }

  setAllClientsSubject(data: Clients[]) {
    this.allClientsSubject.next(data);
  }

  getClient(): Observable<Clients> {
    return this.clientService.getClient().pipe(
      tap((response: any) => {
        return response;
      }), catchError((error: any) => {
        console.log(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
          console.log(this.responseMessage, 'error');
        } else {
          console.log(genericError)
        }
        return of();
      })
    );
  }

  getAllClients(): Observable<Clients[]> {
    return this.clientService.getAllClients().pipe(
      tap((response: any) => {
        return response.sort((a: Clients, b: Clients) => {
          return a.user.firstname.localeCompare(b.user.firstname);
        })
      }),
      catchError((error) => {
        this.snackbarService.openSnackBar(error, 'error');
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
        return of([]);
      })
    );
  }

  getActiveClients(): Observable<Clients[]> {
    return this.clientService.getActiveClients().pipe(
      tap((response: any) => {
        return response.sort((a: Clients, b: Clients) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
        })
      }),
      catchError((error) => {
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        } else {
          this.responseMessage = genericError;
        }
       console.log(this.responseMessage, 'error');
        return of([]);
      })
    );
  }
}
