# Hyperlocal Marketplace Application

This project is a hyperlocal marketplace web application built using Next.js 16 (App Router), TypeScript, Prisma ORM, PostgreSQL (Supabase), and Tailwind CSS.

The application allows vendors to create and manage their grocery shops and product catalogues, lets customers discover nearby approved stores based on their location, browse store items, manage their cart, and place orders. It also includes an admin portal for reviewing and approving vendor shop registrations and overseeing system-wide orders.

---

## Application URLs

The application contains the following accessible pages:

- **Home Page** (`/`): Landing page with navigation links to the main portals.
- **Vendor Portal** (`/vendor`): Vendor dashboard for managing shop details, location coordinates, and product items.
- **Customer Portal** (`/customer`): Customer store discovery page listing nearby approved shops sorted by distance.
- **Single Store Page** (`/customer/shops/[id]`): Dedicated shop page displaying store information and available product catalogue.
- **Customer Cart** (`/customer/cart`): Full cart page for updating item quantities, removing items, and entering delivery address checkout.
- **Customer Orders** (`/customer/orders`): Order history page displaying all past orders placed by the customer.
- **Admin Portal** (`/admin`): Governance dashboard for admins to approve, reject, or disable vendor shops and view all platform orders.

---

## Local Setup Instructions

Follow these steps to run the application locally on your machine.

### 1. Prerequisites
Make sure you have Node.js (version 18 or higher) and npm installed.

### 2. Install Dependencies
Run the following command in the project root folder to install all required packages:

```bash
npm install
```

### 3. Environment Variables Setup
Create a `.env` file in the root directory and add your Supabase PostgreSQL connection string and JWT secret:

```env
DATABASE_URL="postgresql://postgres.[your-id]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[your-id]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key"
```

### 4. Database Setup
Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

### 5. Seed Test Accounts (Optional)
To seed initial test accounts for admin, vendor, and customer along with sample store products, run:

```bash
npx tsx scripts/seed-users.ts
```

### 6. Start the Development Server
Start the local Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## Seeded Credentials for Testing

You can log in to the application using the following test accounts:

- **Admin Account**: Email: `admin@gmail.com` | Password: `admin@gmail.com`
- **Vendor Account**: Email: `vendor@gmail.com` | Password: `vendor@gmail.com`
- **Customer Account**: Email: `customer@gmail.com` | Password: `customer@gmail.com`

---

## Thought Process, Design Decisions, and Architecture Trade-offs

When building this project, I made several core architectural choices to keep the codebase clean, fast, and easy to maintain.

First, I chose Next.js 16 Server Components to handle data fetching directly on the server instead of writing client-side useEffect hooks. Fetching data directly inside page components querying Prisma eliminates client-side loading spinners on page load and avoids sending unneeded API fetching logic to the browser.

For authentication, I implemented JSON Web Tokens (JWT) stored inside HTTP-Only cookies. Using HTTP-Only cookies prevents client-side scripts from reading the token, protecting the application against cross-site scripting (XSS) attacks while allowing both Server Components and API route handlers to verify user sessions cleanly.

For calculating the distance between customers and vendors, I used the Haversine formula written directly in TypeScript. Since hyperlocal apps need to sort stores by geographic distance, computing this in code keeps the setup simple without requiring extra database spatial extensions like PostGIS for a small assignment. In a large production app with millions of coordinates, PostGIS spatial indexing would be used instead.

For cart management, I enforced a single-shop constraint where a cart belongs to one store at a time. If a customer adds an item from a different shop, the system clears the previous shop items and switches the cart to the new store. This avoids the logistical complexity of handling multi-vendor orders in a minimal application.

Lastly, I implemented optimistic UI updates for cart quantity buttons (+ and -) and item removals. When a user clicks to change quantities, the UI updates the numbers and totals instantly in memory before sending the request to the database, ensuring the app feels fast and responsive.

---

## Project Assumptions

Here are the key operational assumptions made during development:

1. **Location Detection**: I assumed that browser HTML5 Geolocation is the primary method for detecting customer coordinates, with an IP-based location API fallback when GPS permission is not granted.
2. **Payment Processing**: I assumed a simplified checkout flow where orders are placed directly with a delivery address. Payment gateway integration is treated as an out-of-scope feature.
3. **Vendor Approval Workflow**: Vendors can register and set up their shop details immediately, but their shop is hidden from customer discovery lists until an Admin marks the shop as APPROVED.
4. **Cart Storage**: Each customer account has one active cart stored in PostgreSQL.

---

## API Documentation

Below is a summary of the backend API endpoints available in the application.

### Authentication API

- `POST /api/register`: Registers a new user account. Accepts `name`, `email`, `password`, and `role` (`CUSTOMER`, `VENDOR`, or `ADMIN`).
- `POST /api/login`: Authenticates a user using email and password, returning user details and setting an HTTP-Only session token cookie.
- `POST /api/logout`: Clears the authentication token cookie and logs out the user.
- `GET /api/profile`: Retrieves the currently authenticated user profile based on the request token cookie.

### Vendor API

- `POST /api/vendor/shop`: Creates or updates the vendor shop details including store name, address, description, latitude, and longitude.
- `POST /api/vendor/products`: Adds a new product to the vendor store catalogue (title, price, image URL, availability).
- `PUT /api/vendor/products/[id]`: Updates an existing product in the vendor catalogue.
- `DELETE /api/vendor/products/[id]`: Deletes a product from the vendor catalogue.

### Customer API

- `GET /api/customer/shops?lat=28.6139&lng=77.2090`: Returns a list of all approved vendor stores sorted by distance from the provided latitude and longitude.
- `GET /api/customer/shops/[id]`: Returns details and available products for a specific shop.
- `POST /api/customer/cart`: Adds a product to the customer cart.
- `PUT /api/customer/cart/[itemId]`: Updates the quantity of a specific item in the cart. If quantity is 0 or less, the item is removed.
- `DELETE /api/customer/cart/[itemId]`: Removes an item from the customer cart.
- `POST /api/customer/orders`: Converts active cart items into a confirmed customer order with the provided delivery address.

### Admin API

- `PATCH /api/admin/vendors/[shopId]`: Updates a vendor shop status to `APPROVED`, `REJECTED`, or `DISABLED`.
- `GET /api/admin/orders`: Retrieves a system-wide list of all customer orders across all stores.

---

## Future Feature Extension Plan

This section describes how out-of-scope features could be integrated into the project architecture in the future.

### Payment Gateway Integration
To add online payments, I would integrate Stripe or Razorpay. I would add a `Payment` model in Prisma linked to the `Order` table to track payment status, transaction ID, and payment method. During checkout, the server would create a payment session, and an asynchronous webhook endpoint (`POST /api/webhooks/stripe`) would update the order status to PAID once confirmation is received from the payment provider.

### Live Delivery Tracking
To implement real-time delivery tracking, I would introduce a `DeliveryPartner` user role and a `DeliveryAssignment` table. Using WebSockets (Socket.io) or Server-Sent Events (SSE), the delivery agent app would stream live latitude and longitude coordinates to the server, which would then broadcast the location to the customer order tracking screen.

### Push Notifications
For push notifications, I would integrate Firebase Cloud Messaging (FCM) or the Web Push API. I would store an `fcmToken` column on the `User` table and trigger automated push messages to customers whenever their order status changes (for example, when an order is accepted by a vendor or out for delivery).

### Inventory Management
To handle product inventory control, I would add a `stockQuantity` field to the `Product` model. During checkout, order creation logic would be wrapped inside a `prisma.$transaction` block to atomically verify available stock and decrement product quantities, preventing overselling during concurrent purchases.

### Order Status Workflow
To expand order processing, I would extend the `OrderStatus` enum from a simple status to a complete workflow (`PENDING` -> `ACCEPTED` -> `PREPARING` -> `OUT_FOR_DELIVERY` -> `DELIVERED` -> `CANCELLED`). I would provide state transition buttons on the vendor and delivery dashboards to update order stages step by step.

### Multi-Vendor Cart
To support adding items from multiple stores in a single cart, I would remove the single-shop constraint on the `Cart` model. At checkout, the backend would group cart items by `shopId` and automatically split the cart into separate sub-orders for each respective vendor.

### Search and Discovery
To improve product search, I would implement PostgreSQL full-text search indexes (`tsvector`) on `Product` and `Shop` models. This would allow fast title matching, category filtering, and fuzzy text search across all stores.

### Reviews and Ratings
To add feedback functionality, I would create a `Review` model storing ratings (1 to 5 stars) and text comments linked to `customerId`, `shopId`, and `orderId`. Reviews would only be permitted for verified completed orders, and average ratings would be displayed on store cards.

### Coupons and Discounts
To implement promotional offers, I would add a `Coupon` model storing promo codes, discount percentages or fixed amounts, minimum order requirements, and expiration dates. The cart calculation logic would validate entered promo codes and apply discounts before order confirmation.

### Analytics and Reporting
To provide vendor business insights, I would create an analytics API endpoint (`GET /api/vendor/analytics`) that runs SQL aggregate queries over past orders to calculate total revenue, daily sales trends, and top-selling items.
