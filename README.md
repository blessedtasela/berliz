# Berliz — Frontend Application

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-netlify-badge/deploy-status)](https://app.netlify.com/sites/berliz/deploys)

Berliz is a **fitness and combat sports web platform** that lets users track workouts, monitor progress, and engage with fitness content. This frontend is built with **Angular** and **Tailwind CSS**, and is hosted on **Netlify** with **Cloudflare** managing the domain and SSL.

## 🚀 Live Demo
[https://berliz.fitness](https://berliz.fitness)

## 🛠️ Technologies
- **Angular** — Frontend framework  
- **TypeScript** — Application logic  
- **Tailwind CSS** — Responsive design and styling  
- **Netlify** — Hosting and deployment  
- **Cloudflare** — DNS management and SSL

## 📁 Project Structure
```text
.angular/                  # Angular CLI cache
src/                       # Source code
  app/                     # Main Angular app
  assets/                  # Static assets (images, icons, fonts)
  environments/            # API & environment config
angular.json               # Angular CLI configuration
netlify.toml               # Netlify deployment configuration
package.json               # Dependencies and scripts
tsconfig.json              # TypeScript configuration
robots.txt                 # Web crawler instructions
sitemap.xml                # Sitemap for search engines
🚦 Features Implemented
Angular app scaffolded with Angular CLI

Hosted on Netlify with a custom domain (berliz.fitness)

Environment configuration supported via .env

Basic routing implemented

Responsive UI for desktop and mobile

Static SEO files (robots.txt and sitemap.xml) included

📌 Setup Instructions
Clone the repository

bash
Copy code
git clone https://github.com/blessedtasela/berliz.git
cd berliz
Install dependencies

bash
Copy code
npm install
Configure environment variables
Create a .env file in the root (do not commit it):

ini
Copy code
API_URL=https://api.berliz.fitness
Run the development server

bash
Copy code
ng serve
Visit http://localhost:4200

Build for production

bash
Copy code
ng build --prod
The production-ready files are generated in dist/.

Run tests

bash
Copy code
ng test
📚 Notes
Hosted on Netlify; domain managed via Cloudflare

Environment variables are sensitive — do not push .env to GitHub

SEO and bot control are handled via robots.txt and sitemap.xml

