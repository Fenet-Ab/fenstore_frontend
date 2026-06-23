# ✨ FenStore Frontend Client

A sleek, premium, and highly responsive **Next.js** e-commerce frontend built using **React 19** and styled with **Tailwind CSS v4**. 

This client serves as the user-facing storefront and administrative dashboard for **FenStore** (*"Where Elegance Meets Innovation"*), delivering an executive-level shopping experience complete with loyalty rewards tracking, dynamic review analytics, native Chapa payments, and a live user-to-admin support chat.

---

## 🎨 Design & Aesthetic Philosophy

FenStore is styled using modern, premium web elements:
*   **Rich Dark Accents & Gradients**: Blends sleek carbon-fibre gradients, gold accents (`#D4AF37`), and clean backgrounds for a luxury-brand aesthetic.
*   **Smooth Micro-animations**: Micro-interactions, bounce scrolling indicators, page loaders, and hover-triggered transformation effects.
*   **Optimal Typography**: Configured with Vercel's premium **Geist Sans** and **Geist Mono** font families for maximum readability.
*   **Fully Responsive**: Handcrafted breakpoints ensuring seamless usability across mobile, tablet, and ultra-wide monitor screens.

---

## 🌟 Core Features

### 🛍️ Client Experience
*   **Dynamic Landing & Categories**: Implements scroll-anchored hero headers, categorizing showcase sections (Clothing, Electronics, Shoes, Accessories) with clean grid layouts.
*   **Premium Product Details (`/products/[id]`)**: Full specification configurations (dynamic selection of colors, sizes, and storage tiers) alongside real-time user reviews and interactive aggregate star rating charts.
*   **Interactive Cart Page (`/cart`)**: Detailed subtotal calculations, product specifications review, delivery address entry, and toggle options to apply accrued loyalty points for instant order discounts.
*   **Unified Support Chat (`FloatingSupportChat`)**: A floating support window accessible on all client pages allowing customers to chat directly with admin support.
*   **Loyalty Points & Profile (`/Profile`)**: Custom user hub showing personal metrics, and current tier status (Bronze to Obsidian).

### 🛡️ Administrative Dashboard (`/Admin`)
*   **Live Executive Stats**: Total sales, active registrations, order count, and system metrics updated dynamically.
*   **Market Share Analytics**: Custom-rendered category sales share percentages mapped into colored graphs.
*   **Product Database Manager**: Form inputs to create items, upload images to Supabase storage buckets, adjust prices, edit attributes, and soft-delete listings.
*   **Central Customer Support Hub**: Real-time support messaging dashboard showing distinct threads with active users, allowing admins to respond immediately.

---

## 🛠️ Technology Stack

*   **Core Framework**: Next.js 16 (App Router)
*   **Runtime Library**: React 19
*   **Styling**: Tailwind CSS v4 & PostCSS
*   **Icons Library**: Lucide React & React Icons
*   **Toast Notifications**: React Toastify (configured in dark mode)
*   **Client API Connection**: Standard HTTP Fetch APIs (configured to call the production Render-hosted APIs by default)

---

## 📂 Page Routing Structure

*   📁 `app/`
    *   📄 `page.tsx` - Homepage with Hero section and categorized product lists.
    *   📁 `products/`
        *   📄 `page.tsx` - Searchable catalog of all products.
        *   📁 `[id]/`
            *   📄 `page.tsx` - Product details, custom options, and reviews.
    *   📁 `cart/`
        *   📄 `page.tsx` - Cart items reviewer, shipping address, and loyalty point discounts.
    *   📁 `orders/`
        *   📄 `page.tsx` - User's order history page with Chapa return URL status handlers.
    *   📁 `Profile/`
        *   📄 `page.tsx` - Account metadata and loyalty points dashboard.
    *   📁 `Admin/`
        *   📄 `page.tsx` - Executive dashboard (sales statistics, inventory creation forms, live customer support chat logs).
    *   📁 `login/` & `register/` - User access control.
    *   📁 `about/` - Branding philosophy and loyalty details.

---

## 🚀 Running the Project

### 📋 Prerequisites
Ensure you have **Node.js** (v18.x or above) and **npm** installed.

---

### 🔧 Setup & Installation

1. **Clone the Repository & Navigate to Frontend**:
   ```bash
   cd /home/fenet/Documents/FenStore/frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Connecting to a Local Backend (Optional)**:
   By default, the client points to the hosted production API (`https://fenstore-backend-1.onrender.com/api`).
   
   If you wish to redirect the client to a local backend instance running on `http://localhost:5000/api`, you can search and replace the API base URL in the following files:
   *   `frontend/app/context/CartContext.tsx`
   *   `frontend/app/page.tsx`
   *   `frontend/components/ProductsList.tsx`
   *   `frontend/app/components/Hero/Hero.tsx`
   *   `frontend/app/components/Category/` (various category files)
   *   `frontend/app/Profile/page.tsx`
   *   `frontend/app/components/Support/FloatingSupportChat.tsx`
   *   `frontend/app/components/Register/Register.tsx`
   *   `frontend/app/components/ProductCard/ProductCard.tsx`
   *   `frontend/app/User/page.tsx`
   *   `frontend/app/orders/page.tsx`
   *   `frontend/app/orders/[id]/page.tsx`
   *   `frontend/components/ProductModal.tsx`
   *   `frontend/app/products/page.tsx`
   *   `frontend/app/cart/page.tsx`
   *   `frontend/app/products/[id]/page.tsx`
   *   `frontend/app/Admin/page.tsx`

---

### 🏎️ Running in Development Mode

Start the Next.js local development server:

```bash
npm run dev
```

The application will be accessible at: **`http://localhost:3000](https://fenetshop.vercel.app/`**

---

### 📦 Building for Production

Compile the Next.js production build:

```bash
# Build the optimized production application
npm run build

# Start the compiled production app locally
npm run start
```

---

## 📄 License
This project is licensed under the MIT License.
