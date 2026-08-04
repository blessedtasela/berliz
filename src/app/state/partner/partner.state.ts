import { Partner } from '../../models/partners.interface';

export interface PartnerState {
    loading: boolean;
    error: string | null;

    partners: Partner[];
    activePartners: Partner[];
    selectedPartner: Partner | null;
    myPartner: Partner | null;
}

export const initialPartnerState: PartnerState = {
    loading: false,
    error: null,

    partners: [],
    activePartners: [],
    selectedPartner: null,
    myPartner: null,
};
