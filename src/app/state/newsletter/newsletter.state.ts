import { Newsletter, NewsletterMessage } from '../../models/newsletter.model';

export interface NewsletterState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    newsletters: Newsletter[];
    activeNewsletters: Newsletter[];
    newsletterMessages: NewsletterMessage[];
}

export const initialNewsletterState: NewsletterState = {
    loading: false,
    error: null,
    lastMessage: null,

    newsletters: [],
    activeNewsletters: [],
    newsletterMessages: [],
};
