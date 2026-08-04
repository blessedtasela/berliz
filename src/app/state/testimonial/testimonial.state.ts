import { Testimonials } from '../../models/testimonials.model';

export interface TestimonialState {
    loading: boolean;
    error: string | null;

    testimonials: Testimonials[];
    activeTestimonials: Testimonials[];
    selectedTestimonial: Testimonials | null;
}

export const initialTestimonialState: TestimonialState = {
    loading: false,
    error: null,

    testimonials: [],
    activeTestimonials: [],
    selectedTestimonial: null,
};
