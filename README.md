# Hyperlocal Marketplace

A minimal hyperlocal marketplace web application built with Next.js 16 (App Router), Prisma ORM, PostgreSQL (Supabase), and Tailwind CSS v4.

The project allows vendors to list nearby grocery stores, customers to browse nearby stores and order products, and admins to approve or reject vendor registrations.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Server Components)
- **Language**: TypeScript
- **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM
- **Styling**: Tailwind CSS v4
- **Authentication**: Custom JWT in HTTP-Only Cookies + bcryptjs password hashing

---

## ⚙️ Features

### 1. Vendor Portal (`/vendor`)
- Register and log in as a Vendor
- Configure shop details (Name, Address, Description, Latitude & Longitude with Auto-Detect location)
- Manage product catalogue (Add, Edit, Delete products with title, price, image URL, and availability)

### 2. Customer Portal (`/customer`)
- Auto-detected geolocation or IP fallback to discover nearby approved stores
- Dedicated single store page (`/customer/shops/[id]`) to view store products
- Real-time cart management with quantity updates (`+` / `-`) and delivery checkout
- Customer order history tracking (`/customer/orders`)

### 3. Admin Portal (`/admin`)
- View all registered vendors and their store status
- Approve, reject, or disable vendor shops
- System-wide order history oversight

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres.[your-id]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[your-id]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. Setup Database Schema
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Test Accounts (Seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin@gmail.com` |
| **Vendor** | `vendor@gmail.com` | `vendor@gmail.com` |
| **Customer** | `customer@gmail.com` | `customer@gmail.com` |
