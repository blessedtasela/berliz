import { ContactUs, ContactUsMessage } from '../../models/contact-us.model';

export interface ContactUsState {
    loading: boolean;
    error: string | null;
    lastMessage: string | null;

    contactUs: ContactUs[];
    contactUsMessages: ContactUsMessage[];
}

export const initialContactUsState: ContactUsState = {
    loading: false,
    error: null,
    lastMessage: null,

    contactUs: [],
    contactUsMessages: [],
};
