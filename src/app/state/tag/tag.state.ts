import { Tags } from '../../models/tags.interface';

export interface TagState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    tags: Tags[];
    activeTags: Tags[];
}

export const initialTagState: TagState = {
    loading: false,
    error: null,
    lastMessage: null,

    tags: [],
    activeTags: [],
};
