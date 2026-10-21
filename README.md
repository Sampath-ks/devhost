# 🌱 KisanSetu (किसान सेतु)

> **Bridging Marginal Farmers Directly to Fair Markets**  
> A modern, transparent agri-commerce platform featuring intelligent multi-farmer lot recommendations, direct fair-trade purchasing, produce listings, warehousing, and live bidding.

---

## 📋 Table of Contents
1. [About KisanSetu](#-about-kisansetu)
2. [Prerequisites](#-prerequisites)
3. [Quick Start (How to Run)](#-quick-start-how-to-run)
4. [How to Use the Application (Simple Guide)](#-how-to-use-the-application-simple-guide)
   - [1. Getting Started & Logging In](#1-getting-started--logging-in)
   - [2. Buyer Guide (Marketplace & Smart Multi-Farmer Splitting)](#2-buyer-guide-marketplace--smart-multi-farmer-splitting)
   - [3. Farmer Guide (Listings, Pricing & Order Fulfillment)](#3-farmer-guide-listings-pricing--order-fulfillment)
   - [4. Cold Storage & Warehousing](#4-cold-storage--warehousing)
   - [5. Produce Bidding & Auctions](#5-produce-bidding--auctions)
   - [6. Admin Dashboard](#6-admin-dashboard)
5. [Key Features](#-key-features)
6. [Project Structure](#-project-structure)
7. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🌾 About KisanSetu

Small and marginal farmers often face low price realization when selling individually, while commercial buyers struggle to aggregate quality produce across distributed smallholdings.

**KisanSetu** solves this with:
- **Direct Buying**: Buyers purchase directly from verified farmers without middlemen.
- **Smart Multi-Farmer Split Engine**: Automatically combines lots from multiple farmers when a buyer's requested volume exceeds what any single farmer produces.
- **Fair Pricing**: Real-time market reference prices guide honest negotiations.
- **End-to-End Tracking**: Order requests, approvals, dispatches, and inventory updates are synced seamlessly.

---

## ⚙️ Prerequisites

Before starting, ensure you have the following installed on your computer:
- **Node.js**: version `18.0.0` or higher ([Download Node.js](https://nodejs.org/))
- **npm** (comes bundled with Node.js) or **pnpm** / **yarn**
- Modern web browser (Chrome, Edge, Firefox, Safari)

---

## 🚀 Quick Start (How to Run)

Follow these simple steps to launch the application on your computer:

### Step 1: Open Terminal in the Project Directory
Open your terminal (PowerShell, Command Prompt, or VS Code integrated terminal) and make sure you are inside the `devhost` folder.

### Step 2: Install Dependencies
If running for the first time or after pulling new updates:
```bash
npm install
```

### Step 3: Start the Development Server
Run the local development server:
```bash
npm run dev
```

### Step 4: Open in Your Browser
Once the dev server starts, click or visit:
```text
http://localhost:5173
```

*(To stop the server at any time, press `Ctrl + C` in the terminal.)*

---

## 📖 How to Use the Application (Simple Guide)

### 1. Getting Started & Logging In
1. Open `http://localhost:5173`. You will land on the interactive **Hub** page.
2. Click **Login** or **Register** in the top navigation.
3. Select your role:
   - **Farmer**: If you want to list crops, view market rates, and accept buyer orders.
   - **User (Buyer)**: If you want to browse produce, order bulk quantities, or use multi-farmer lot recommendations.
4. Enter your email and password (minimum 6 characters), then submit to enter your role-specific dashboard.

---

### 2. Buyer Guide (Marketplace & Smart Multi-Farmer Splitting)

Navigate to **Buyer Dashboard** (`/buyer`):
- **Browse Available Produce**: Filter by crop category (Vegetables, Grains, Fruits, etc.), search by name, or sort by price.
- **Single Farmer Purchase**:
  - If a single farmer has enough stock for your required amount, click **Buy Now** to place an order directly with that farmer.
- **Smart Multi-Farmer Recommendation**:
  - Need a large volume that no single farmer can fulfill alone?
  - Enter your desired quantity (e.g., 100 kg or 100 g) in the **Smart Multi-Farmer** section.
  - Choose your optimization strategy:
    - **Balanced / Optimal**: Best combination of distance, price, and quality.
    - **Lowest Price**: Minimizes total procurement cost.
    - **Fastest Delivery**: Prioritizes nearest farmers with ready inventory.
  - KisanSetu calculates the exact share each farmer can supply (for example: Farmer A supplies 50 kg, Farmer B supplies 30 kg, and Farmer C supplies 20 kg).
  - Click **Place Orders to All Farmers** to split and dispatch individual purchase orders with one click.
- **Orders & Status**:
  - View current order status (**Pending**, **Confirmed**, **Dispatched**, **Delivered**).
  - If a farmer cancels an order, the produce quantity is automatically returned back to available stock.

---

### 3. Farmer Guide (Listings, Pricing & Order Fulfillment)

Navigate to **Farmer Dashboard** (`/farmer`):
- **Overview**: Check active listings, total earnings, pending delivery commitments, and alerts.
- **Add Produce Listing** (`/farmer/add`):
  - Add your harvested crop, available quantity (in kg), quality grade, harvest date, and asking price per unit.
  - Your listing instantly appears in the public buyer marketplace.
- **Manage Orders**:
  - Review incoming buyer requests and split allocations.
  - Update status to **Accepted**, **Dispatched**, or **Delivered**.
  - If an order cannot be fulfilled, cancel it to restore the listing's available stock.
- **Market Prices** (`/farmer/prices`):
  - View real-time Mandi/APMC benchmark prices to price your crops competitively.

---

### 4. Cold Storage & Warehousing (`/store`)
- Logged-in farmers and buyers can access the **Warehouse & Storage** section.
- View temperature-controlled storage spaces, availability, booking rates, and humidity logs to preserve harvest quality between seasons.

---

### 5. Produce Bidding & Auctions (`/auction`)
- Access live open auctions for premium and bulk crop lots.
- View active countdowns, current highest bids, and place competitive bids directly in real time.

---

### 6. Admin Dashboard (`/admin`)
- Accessible directly at `/admin` or using the keyboard shortcut:
  > **Shortcut**: Press `Ctrl + Shift` simultaneously anywhere in the application.
- View platform-wide statistics, active farmer listings, dispute resolutions, and verification logs.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Smart Lot Aggregation** | Automatically fulfills large buyer orders by combining partial lots from multiple nearby farmers. |
| **Real-time Inventory Sync** | Automatically deducts ordered stock and restores stock if an order is cancelled. |
| **Fair Price Transparency** | Integrated APMC market benchmark comparison prevents under-pricing. |
| **Unified Single Dashboard** | Clean sidebar navigation with inline split recommendations—no confusing screen hops. |
| **Multi-Unit Support** | Seamlessly supports both kilogram (`kg`) and gram (`g`) quantity ordering. |

---

## 📁 Project Structure

```text
devhost/
├── src/
│   ├── components/            # Reusable UI widgets, layout shells, transitions
│   │   ├── hub/               # Landing page hero and portal sections
│   │   ├── layout/            # Sidebar navigation and headers
│   │   └── transitions/       # Smooth page fill animations
│   ├── data/
│   │   ├── db.json            # Mock database holding listings, orders & users
│   │   └── produceSeed.ts     # Initial seed dataset for crops & farmers
│   ├── hooks/
│   │   ├── useListings.ts     # Central hook for produce listings & stock sync
│   │   └── useLenis.ts        # Smooth scrolling controller
│   ├── pages/
│   │   ├── admin/             # Platform oversight & analytics
│   │   ├── auction/           # Live produce bidding & auctions
│   │   ├── auth/              # Unified login and registration
│   │   ├── buyer/             # Buyer marketplace & multi-farmer recommendation
│   │   ├── farmer/            # Farmer dashboard, crop listings & APMC rates
│   │   └── store/             # Cold storage and warehousing inventory
│   ├── routes/                # Application routes and role-based access guards
│   ├── App.tsx                # App root provider and global shortcuts
│   └── main.tsx               # Entry point
├── package.json               # Dependencies and run scripts
└── README.md                  # This documentation guide
```

---

## ❓ Troubleshooting & FAQs

- **Q: Can I test without creating a new backend server?**  
  *A:* Yes! KisanSetu runs entirely on local mock state backed by `src/data/db.json` and browser storage.
- **Q: Why does multi-farmer recommend 3 farmers for 100 kg of Tomatoes?**  
  *A:* The tomato lots are distributed among distinct verified farmers (50 kg, 30 kg, and 20 kg). When you request 100 kg, the algorithm aggregates all three lots to fulfill your entire order.
- **Q: How do I switch roles?**  
  *A:* Click logout in the sidebar and log in or register with the desired role (**Farmer** or **Buyer**).

---

*Made with ❤️ for Indian Agriculture & Marginal Farmers.*
