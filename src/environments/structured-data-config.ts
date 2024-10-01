export const StructuredDataConfig = {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Berliz Fitness",
      "url": "https://berliz.fitness",
      "logo": "https://berliz.fitness/logo.png",
      "sameAs": [
        "https://www.facebook.com/berliz",
        "https://www.instagram.com/berliz"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-234-567-890",
        "contactType": "Customer Service"
      }
    },
    localBusiness: {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Berliz Fitness",
      "image": "https://berliz.fitness/logo.png",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Fitness St",
        "addressLocality": "Burnaby",
        "addressRegion": "BC",
        "postalCode": "V5G 3H2",
        "addressCountry": "CA"
      },
      "telephone": "+1-234-567-890",
      "openingHours": "Mo-Sa 08:00-18:00",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "49.2488",
        "longitude": "-123.0016"
      }
    },
    webpage: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Berliz Fitness - Home",
      "url": "https://berliz.fitness/home",
      "description": "Welcome to Berliz Fitness. Discover personalized training solutions that combine martial arts, fitness, and wellness."
    },
    product: {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Berliz Fitness Membership",
      "description": "Premium fitness membership that includes personal training, martial arts, and nutrition plans.",
      "image": "https://berliz.fitness/product-image.png",
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "199.99",
        "url": "https://berliz.fitness/membership",
        "availability": "https://schema.org/InStock"
      }
    },
    review: {
      "@context": "https://schema.org",
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "John Doe"
      },
      "description": "The Berliz fitness program transformed my life. Highly recommend!"
    },
    article: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "The Benefits of Martial Arts for Fitness",
      "image": "https://berliz.fitness/article-image.png",
      "author": {
        "@type": "Person",
        "name": "Jane Smith"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Berliz Fitness",
        "logo": {
          "@type": "ImageObject",
          "url": "https://berliz.fitness/logo.png"
        }
      },
      "datePublished": "2024-09-29",
      "description": "Martial arts offer a unique way to build fitness, confidence, and discipline. Learn the key benefits of adding martial arts to your fitness routine."
    },
    person: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "John Trainer",
      "image": "https://berliz.fitness/john-trainer.jpg",
      "jobTitle": "Personal Trainer",
      "worksFor": {
        "@type": "Organization",
        "name": "Berliz Fitness"
      },
      "sameAs": [
        "https://www.linkedin.com/in/john-trainer",
        "https://twitter.com/john_trainer"
      ]
    }
  };
  