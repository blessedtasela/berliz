import { Component } from '@angular/core';

export interface HelpCenterArticle {
  id: string;
  question: string;
  answer: string;
  link?: { label: string; route: string };
}

export interface HelpCenterCategory {
  id: string;
  label: string;
  caption: string;
  icon: string;
  articles: HelpCenterArticle[];
}

/**
 * Real, curated support content for the public Help Center hub. Deliberately
 * static/hardcoded rather than backend-driven, unlike FaqsPageComponent (which
 * loads user-editable Q&A from the faq store) — Help Center groups guidance
 * about how the app itself works (bookings, subscriptions, account) into fixed
 * categories, whereas FAQs is the open-ended admin-editable list. Each article
 * that maps to a real, already-built feature links straight to it rather than
 * describing it in prose only.
 */
@Component({
  selector: 'app-help-center-page',
  templateUrl: './help-center-page.component.html',
  styleUrls: ['./help-center-page.component.css']
})
export class HelpCenterPageComponent {

  expandedIds = new Set<string>();

  readonly categories: HelpCenterCategory[] = [
    {
      id: 'getting-started',
      label: 'Getting Started',
      caption: 'Create your account and set up your profile',
      icon: 'user-plus',
      articles: [
        {
          id: 'create-account',
          question: 'How do I create a Berliz account?',
          answer: 'Sign up with your email, or use "Quick Sign Up" for a faster start. You\'ll receive a verification email — click the link inside it to activate your account before logging in.',
          link: { label: 'Sign up', route: '/sign-up' }
        },
        {
          id: 'complete-profile',
          question: 'What do I need to complete my profile?',
          answer: 'Add your name, photo, bio, address and phone number from your dashboard. A complete profile is required before you can book trainers/centers or apply as a partner.',
          link: { label: 'Go to my profile', route: '/dashboard/profile' }
        },
        {
          id: 'roles',
          question: 'What\'s the difference between Client, Trainer, Center and Member?',
          answer: 'A Client books trainers and centers. A Trainer offers coaching and manages their own clients. A Center manages a facility, its staff and members. A Member holds a membership at a specific center. Every account starts as a base User and can apply for a Trainer or Center role from Partnership.',
          link: { label: 'Apply as a partner', route: '/dashboard/partnership' }
        }
      ]
    },
    {
      id: 'bookings',
      label: 'Bookings & Availability',
      caption: 'Book a session and manage your schedule',
      icon: 'calendar',
      articles: [
        {
          id: 'how-booking-works',
          question: 'How do I book a trainer or center?',
          answer: 'Open a trainer or center\'s profile and pick an open slot from their published availability. You\'ll get a confirmation once the provider accepts, and a notification if anything changes.',
          link: { label: 'Browse trainers', route: '/trainers' }
        },
        {
          id: 'manage-bookings',
          question: 'Where can I see or cancel my bookings?',
          answer: 'All bookings you\'ve made live under My Bookings in your dashboard. Only a pending booking can be cancelled — once a provider confirms it, contact them directly or report a problem if you need to change it.',
          link: { label: 'My Bookings', route: '/dashboard/my-bookings' }
        },
        {
          id: 'provider-availability',
          question: 'I\'m a trainer/center — how do I set my availability?',
          answer: 'From your provider bookings page you can set recurring weekly hours per day. Clients can only book inside the windows you publish there.',
          link: { label: 'My provider bookings', route: '/dashboard/my-provider-bookings' }
        }
      ]
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      caption: 'Plans, billing and what each tier includes',
      icon: 'credit-card',
      articles: [
        {
          id: 'choose-plan',
          question: 'What subscription plans are available?',
          answer: 'Berliz offers tiered plans (Basic, Plus and Exclusive) with increasing access to centers and trainers. Compare pricing and access scope, then select a plan — no payment details are stored anywhere but your subscription record.',
          link: { label: 'My Subscriptions', route: '/dashboard/my-subscriptions' }
        },
        {
          id: 'manage-subscription',
          question: 'How do I manage or cancel my subscription?',
          answer: 'Your active plan, status and history are all on the My Subscriptions page. If something looks wrong with a charge or your plan status, use Report a Problem with the "Billing or subscription" category so our team can look into it directly.',
          link: { label: 'Report a billing problem', route: '/report-problem' }
        }
      ]
    },
    {
      id: 'trainers-centers',
      label: 'Trainers & Centers',
      caption: 'Find providers or become one',
      icon: 'users',
      articles: [
        {
          id: 'find-trainer',
          question: 'How do I find the right trainer?',
          answer: 'Browse the trainer directory, filter by specialty, and open a profile to see their bio, pricing, reviews and availability before booking.',
          link: { label: 'Browse trainers', route: '/trainers' }
        },
        {
          id: 'find-center',
          question: 'How do I find a gym or fitness center?',
          answer: 'The centers directory lists every active facility on Berliz with its equipment, staff and location, so you can compare before booking or applying for membership.',
          link: { label: 'Browse centers', route: '/centers' }
        },
        {
          id: 'become-partner',
          question: 'How do I become a trainer or list my center?',
          answer: 'Apply from the Partnership page. Your application is reviewed by our team — you\'ll be notified once it\'s approved and your Trainer or Center profile goes live.',
          link: { label: 'Apply as a partner', route: '/dashboard/partnership' }
        }
      ]
    },
    {
      id: 'account-settings',
      label: 'Account & Settings',
      caption: 'Passwords, notifications and account info',
      icon: 'settings',
      articles: [
        {
          id: 'reset-password',
          question: 'I forgot my password — how do I reset it?',
          answer: 'Use "Forgot password" on the login page. We\'ll email you a reset link — it expires after a short window, so request a fresh one if it doesn\'t work.',
          link: { label: 'Reset password', route: '/login/reset-password' }
        },
        {
          id: 'notification-prefs',
          question: 'How do I manage notifications?',
          answer: 'Every booking, message and status change generates an in-app notification. Review and manage them from your dashboard.',
          link: { label: 'My notifications', route: '/dashboard/my-notifications' }
        },
        {
          id: 'update-settings',
          question: 'Where do I update my account settings?',
          answer: 'Account-level settings (separate from your public profile) live under Settings in your dashboard.',
          link: { label: 'Settings', route: '/dashboard/settings' }
        }
      ]
    }
  ];

  toggle(id: string): void {
    if (this.expandedIds.has(id)) {
      this.expandedIds.delete(id);
    } else {
      this.expandedIds.add(id);
    }
  }

  isExpanded(id: string): boolean {
    return this.expandedIds.has(id);
  }

  trackByCategory(_: number, category: HelpCenterCategory): string {
    return category.id;
  }

  trackByArticle(_: number, article: HelpCenterArticle): string {
    return article.id;
  }
}
