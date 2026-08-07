import { Faq } from '../../models/faq.model';

export interface FaqState {
    loading: boolean;
    error: string | null;

    faqs: Faq[];
    activeFaqs: Faq[];
}

export const initialFaqState: FaqState = {
    loading: false,
    error: null,

    faqs: [],
    activeFaqs: [],
};
