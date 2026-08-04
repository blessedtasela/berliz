import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { MemberService } from '../../services/member.service';
import * as A from './member.actions';

@Injectable()
export class MemberEffects {

    constructor(
        private actions$: Actions,
        private svc: MemberService,
    ) { }

    // =========================================================================
    // MEMBER CRUD
    // =========================================================================
    loadMembers$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMembers, A.refreshMembers),
        mergeMap(() => this.svc.getAllMembers().pipe(
            map(r => A.loadMembersSuccess({ response: r })),
            catchError(e => of(A.loadMembersFailure({ error: e?.error?.message || 'Failed to load members' })))
        ))
    ));

    loadActiveMembers$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadActiveMembers, A.refreshMembers),
        mergeMap(() => this.svc.getActiveMembers().pipe(
            map(r => A.loadActiveMembersSuccess({ response: r })),
            catchError(e => of(A.loadActiveMembersFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    loadMember$ = createEffect(() => this.actions$.pipe(
        ofType(A.loadMember),
        mergeMap(({ id }) => this.svc.getMember(id).pipe(
            map(r => A.loadMemberSuccess({ response: r })),
            catchError(e => of(A.loadMemberFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    addMember$ = createEffect(() => this.actions$.pipe(
        ofType(A.addMember),
        mergeMap(({ data }) => this.svc.addMember(data).pipe(
            map(r => A.addMemberSuccess({ response: r })),
            catchError(e => of(A.addMemberFailure({ error: e?.error?.message || 'Failed to add member' })))
        ))
    ));

    updateMember$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateMember),
        mergeMap(({ data }) => this.svc.updateMember(data).pipe(
            map(r => A.updateMemberSuccess({ response: r })),
            catchError(e => of(A.updateMemberFailure({ error: e?.error?.message || 'Failed to update member' })))
        ))
    ));

    updateMemberStatus$ = createEffect(() => this.actions$.pipe(
        ofType(A.updateMemberStatus),
        mergeMap(({ id }) => this.svc.updateStatus(id).pipe(
            map(r => A.updateMemberStatusSuccess({ response: r })),
            catchError(e => of(A.updateMemberStatusFailure({ error: e?.error?.message || 'Failed' })))
        ))
    ));

    deleteMember$ = createEffect(() => this.actions$.pipe(
        ofType(A.deleteMember),
        mergeMap(({ id }) => this.svc.deleteMember(id).pipe(
            map(() => A.deleteMemberSuccess({ id })),
            catchError(e => of(A.deleteMemberFailure({ error: e?.error?.message || 'Failed to delete member' })))
        ))
    ));
}
