import { Faq } from '../../models/faq.model';

export interface FaqGroup {
  category: string;
  faqs: Faq[];
}

/**
 * Groups a flat FAQ list by category, preserving first-seen order (the backend
 * already returns active FAQs ordered by category then displayOrder, so this
 * just folds the flat list into sections without re-sorting).
 */
export function groupFaqsByCategory(faqs: Faq[]): FaqGroup[] {
  const groups: FaqGroup[] = [];
  const index = new Map<string, FaqGroup>();

  (faqs || []).forEach(faq => {
    const category = faq.category || 'General';
    let group = index.get(category);
    if (!group) {
      group = { category, faqs: [] };
      index.set(category, group);
      groups.push(group);
    }
    group.faqs.push(faq);
  });

  return groups;
}
