import { Injectable } from '@angular/core';
import { MemberService } from './member.service';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { genericError } from 'src/validators/form-validators.module';
import { CenterLike } from '../models/centers.interface';
import { Members } from '../models/members.interface';
import { SnackBarService } from './snack-bar.service';

@Injectable({
  providedIn: 'root'
})
export class MemberStateService {
  private activeMembersSubject = new BehaviorSubject<any>(null);
  public activeMembersData$: Observable<Members[]> = this.activeMembersSubject.asObservable();
  private allMembersSubject = new BehaviorSubject<any>(null);
  public allMembersData$: Observable<Members[]> = this.allMembersSubject.asObservable();
  private MemberSubject = new BehaviorSubject<any>(null);
  public MemberData$: Observable<Members> = this.MemberSubject.asObservable();
  responseMessage: any;

  constructor(private memberService: MemberService,
    private snackbarService: SnackBarService) { }

  setMemberSubject(data: Members) {
    this.MemberSubject.next(data);
  }

  setActiveMembersSubject(data: Members[]) {
    this.activeMembersSubject.next(data);
  }

  setAllMembersSubject(data: Members[]) {
    this.allMembersSubject.next(data);
  }

  getCenter(): Observable<Members> {
    return this.memberService.getMember().pipe(
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

  getAllMembers(): Observable<Members[]> {
    return this.memberService.getActiveMembers().pipe(
      tap((response: any) => {
        return response.sort((a: Members, b: Members) => {
          return a.user.email.localeCompare(b.user.email);
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

  getActiveMembers(): Observable<Members[]> {
    return this.memberService.getActiveMembers().pipe(
      tap((response: any) => {
        return response.sort((a: Members, b: Members) => {
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
