# Berliz — Frontend Application

[![Build Status](https://img.shields.io/badge/status-active-brightgreen)]()

Berliz is a **fitness and combat sports web platform** that allows users to track workouts, view progress, and engage with fitness content. The frontend is built using **Angular**, styled with **Tailwind CSS**, and deployed via **Netlify**.

## 🚀 Live Demo
### Check out the live application:

#### [https://berliz.fitness](https://berliz.fitness)

## 🛠️ Technologies & Libraries
- **Angular** — Frontend framework  
- **TypeScript** — Language for frontend logic  
- **Tailwind CSS** — Styling and responsive design  
- **Angular Router** — Routing and navigation  
- **RxJS** — Reactive programming for handling streams S 
- **Netlify** — Hosting and deployment  
- **Cloudflare** — DNS management and SSL  
- **Axios / HttpClient** — API requests to backend  
- **Ngx-Toastr** — Notifications  
- **Strapi** — Headless CMS for media and content  
- **Other libraries** — Any additional npm packages listed in `package.json`

## 📁 Project Structure
``` text
.angular/                  # Angular CLI cache
src/                       # Source code
  app/                     # Main Angular app folder
  assets/                  # Static assets
  environments/            # Environment configuration
angular.json               # Angular CLI configuration
netlify.toml               # Netlify deployment configuration
package.json               # Project dependencies and scripts
tsconfig.json              # TypeScript configuration
robots.txt                 # Instructions for web crawlers
sitemap.xml                # Sitemap for search engines
```
## 🚦 Features Implemented
- Angular app scaffolded with Angular CLI

- Hosted on Netlify with custom domain (berliz.fitness)

- Environment configurations supported via .env

- Basic routing implemented

- Responsive UI for desktop and mobile

- API integration with Strapi backend for media and content

## 📌 Setup Instructions
### Clone the repository:

``` bash
git clone https://github.com/blessedtasela/berliz.git
cd berliz
```
### Install dependencies:

``` bash
npm install
``` 
### Configure environment variables:
#### Create a .env file in the root (not committed to Git):

``` ini
API_URL=https://api.berliz.fitness
STRAPI_URL=https://strapi.berliz.fitness
```

#### Run the development server:

``` bash
ng serve
```
#### Open your browser at `http://localhost:4200`

### Build for production:

``` bash
ng build --prod
```
#### The production-ready files are generated in dist/.

### Run tests:

``` bash
ng test
```
## 📚 Notes
#### Hosted on Netlify with Cloudflare managing the domain and SSL.

#### Keep environment variables secret; never push .env to GitHub.

#### API requests are handled via Strapi for content management and media.

