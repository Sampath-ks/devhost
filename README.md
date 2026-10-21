# KisanSetu

Bridging marginal farmers directly to fair markets.

---

## How to Start the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the local development server:
   ```bash
   npm run dev
   ```

3. Open the application in your browser:
   ```text
   http://localhost:5173
   ```

---

## Authentication & Role Workflow

Users access the platform through `/login` or `/register`:

1. **Select Role**:
   - **Farmer**: For farmers who want to list crops, view market prices, and fulfill buyer orders.
   - **User (Buyer)**: For buyers who want to browse crops, purchase from farmers, and use multi-farmer lot recommendations.
2. **Account Details**:
   - Provide an email address and a password (minimum 6 characters).
   - New accounts are registered instantly and automatically routed to the corresponding role dashboard (`/farmer` or `/buyer`).

---

## What Has Been Built & How to Use

### 1. Buyer Dashboard (`/buyer`)
- **Browse & Search Produce**: View available crop listings with live stock and pricing.
- **Single Farmer Orders**: Place direct orders when an individual farmer has enough stock to fulfill your requirement.
- **Smart Multi-Farmer Recommendation**:
  - When ordering bulk quantities (in `kg` or `g`) exceeding a single farmer's lot, the platform automatically splits and recommends allocations across multiple distinct farmers (e.g. 50 kg from Farmer A, 30 kg from Farmer B, and 20 kg from Farmer C).
  - Choose an optimization strategy: **Balanced**, **Lowest Price**, or **Fastest Delivery**.
  - Review the allocated split and place orders to all recommended farmers with a single click.
- **Order Tracking**: Track order status (Pending, Confirmed, Dispatched, Delivered).

### 2. Farmer Dashboard (`/farmer`)
- **Produce Listings (`/farmer/add`)**: Create and publish new crop listings with quantity (in kg), quality grade, and asking price.
- **Order Management**: Review incoming buyer orders, see allocated quantities, and update order statuses.
- **Automatic Stock Sync**: When an order is cancelled, the reserved produce quantity is automatically returned back to the available marketplace stock.
- **Market Prices (`/farmer/prices`)**: View APMC mandi benchmark rates to price crops competitively.

### 3. Admin Dashboard (`/admin`)
- Accessible directly at `/admin`.
- View platform-wide metrics, active produce listings, registered users, and system activity.
