import { Members } from '../../models/members.interface';

export interface MemberState {
    loading: boolean;
    error: string | null;

    members: Members[];
    activeMembers: Members[];
    currentMember: Members | null;
}

export const initialMemberState: MemberState = {
    loading: false,
    error: null,

    members: [],
    activeMembers: [],
    currentMember: null,
};
