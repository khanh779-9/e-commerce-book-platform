# Implementation Plan - Professional Angular Architecture

This plan restructures the Angular frontend (`e-commerce-book-platform.client`) into a highly structured, scalable, and professional architecture. It introduces layouts, feature routing, core services, and a premium modern design using Tailwind CSS.

## Structure Overview

We will restructure the application directory under `src/app/` as follows:
```
src/app/
├── core/                  # Singleton services, guards, interceptors, models
│   ├── interceptors/      # JWT token attach, error handler
│   ├── models/            # Product, User, Cart, Category interface models
│   └── services/          # AuthService, ProductService, CartService
├── shared/                # Global reusable components
│   ├── components/        # Navbar, Footer, BookCard, StarRating
│   └── pipes/             # Currency formatter, etc.
├── layouts/               # Layout wrappers
│   ├── main-layout/       # Core layout with Header, Footer, and RouterOutlet
│   └── auth-layout/       # Centered layout for Auth pages
├── features/              # Modular feature components
│   ├── home/              # Homepage with hero, categories, featured books
│   ├── products/          # Search catalog and detail pages
│   ├── cart/              # Cart management & checkout
│   └── auth/              # Login / Register
├── app.ts                 # Main component (simply hosts router-outlet)
├── app.html               # Main template (simply <router-outlet></router-outlet>)
├── app.config.ts          # Angular providers configuration
└── app.routes.ts          # Main route configuration
```

---

## Proposed Changes

### 1. Layout Components
We will define layout wrappers to separate standard pages (with Header/Footer) from clean pages (like Login/Register).

#### [NEW] [main-layout.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/layouts/main-layout/main-layout.ts)
Layout hosting the global Navbar and Footer, with a central `<router-outlet>`.
* Includes high-end glassmorphism navigation bar.
* Responsive desktop/mobile design.

#### [NEW] [auth-layout.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/layouts/auth-layout/auth-layout.ts)
A minimalist layout wrapping authentication forms, styled with abstract gradients.

---

### 2. Core Modules & Models
We'll define structural types and services to handle API communication.

#### [NEW] [models.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/core/models/models.ts)
Contains TypeScript interfaces matching the C# models:
* `Product`, `Category`, `Book`, `Author`, `Publisher`
* `CartItem`, `Cart`, `User`, `ApiResponse`

#### [NEW] [product.service.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/core/services/product.service.ts)
Service using `HttpClient` to communicate with `/api/v1/products`, `/api/v1/categories`, etc.

#### [NEW] [cart.service.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/core/services/cart.service.ts)
Service managing the state of the shopping cart using Angular Signals.

#### [NEW] [auth.service.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/core/services/auth.service.ts)
Service handling user login/logout, state management (signals for current user), and local storage of JWT tokens.

---

### 3. Shared Components
Reusable design atoms across the project.

#### [NEW] [navbar.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/shared/components/navbar/navbar.ts)
Premium navigation header with:
* Logo, links to catalog.
* Realtime shopping cart item counter (connected to `CartService` signals).
* Auth section showing user avatar or "Login" button.

#### [NEW] [footer.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/shared/components/footer/footer.ts)
A dark theme, modern footer containing store information, socials, and newsletter signup.

#### [NEW] [book-card.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/shared/components/book-card/book-card.ts)
Reusable card with:
* Book image, name, category, author, price.
* "Add to Cart" button with micro-animations.

---

### 4. Features & Pages
The functional page views.

#### [NEW] [home.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/features/home/home.ts)
Landing page featuring:
* A modern Hero Section with abstract backgrounds.
* "Shop by Category" sliding track.
* "Featured Books" list fetching products from `ProductService`.

#### [NEW] [product-list.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/features/products/product-list/product-list.ts)
Catalog search/filter view:
* Sidebar with category selection, price range, and search bar.
* Grid displaying `BookCardComponent`.

#### [NEW] [product-detail.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/features/products/product-detail/product-detail.ts)
Detailed book details page with description, specifications, and adding quantity to cart.

#### [NEW] [cart.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/features/cart/cart.ts)
Shopping cart display with quantity modifiers, price summaries, and a "Checkout" action.

#### [NEW] [login.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/features/auth/login/login.ts)
Modern authentication page with validation and auth states.

---

### 5. Routing Config

#### [MODIFY] [app.routes.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/app.routes.ts)
Set up navigation using layouts as routing nodes:
```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'cart', component: CartComponent },
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
```

#### [MODIFY] [app.ts](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/app.ts)
Update component to load `RouterOutlet`.

#### [MODIFY] [app.html](file:///d:/Data/Tailieu/Projects/asp.net/e-commerce-book-platform/e-commerce-book-platform.client/src/app/app.html)
Replace all content with `<router-outlet></router-outlet>`.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in the client directory to ensure syntax correctness and compiler checks pass.

### Manual Verification
- Launch backend and client dev-servers.
- Navigate between different pages (Home -> Catalog -> Detail -> Cart -> Login).
- Verify proxy requests to backend endpoints.
- Check styling responsiveness (mobile / desktop).
