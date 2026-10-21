# KisanSetu

Bridging marginal farmers directly to fair markets.

---

## 🚀 How to Start the Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Open the application in your browser:**
   ```text
   http://localhost:5173
   ```

---

## 🔐 Getting Started & Login Workflow

```text
[ Open App ] ➔ [ Click Login / Register ] ➔ [ Select Role: Farmer or Buyer ] ➔ [ Enter Credentials ] ➔ [ Enter Dashboard ]
```

1. **Go to Login / Register**: Click **Login** or **Register** on the top navigation bar (or visit `/login`).
2. **Select Account Role**:
   - **Farmer**: If you want to list crops, view market prices, and accept buyer orders.
   - **User (Buyer)**: If you want to browse produce, buy from farmers, and use multi-farmer lot splitting.
3. **Enter Credentials**: Provide an email address and a password (minimum 6 characters).
4. **Submit**: You are logged in immediately and automatically routed to your role dashboard (`/buyer` or `/farmer`).

---

## 🛒 Buyer Dashboard Workflow (`/buyer`)

### Workflow 1: Single Farmer Direct Purchase
```text
[ Browse Produce ] ➔ [ Check Farmer Stock & Price ] ➔ [ Click Buy Now ] ➔ [ Track Order Status ]
```
1. **Browse Crops**: Scroll through available produce (Tomatoes, Potatoes, Onions, etc.).
2. **Check Details**: View farmer name, available quantity, quality grade, and price per kg.
3. **Place Order**: If a single farmer has enough stock for your required quantity, click **Buy Now**, enter your amount, and confirm.
4. **Track Status**: Monitor your placed order under the orders section with live status updates (**Pending**, **Confirmed**, **Dispatched**, **Delivered**).

---

### Workflow 2: Bulk Purchase via Smart Multi-Farmer Split
```text
[ Enter Bulk Quantity ] ➔ [ System Splits Across Farmers ] ➔ [ Select Strategy ] ➔ [ Place Orders to All Farmers ]
```
1. **Enter Required Quantity**: In the Smart Multi-Farmer section, select a crop and type in your needed amount (supports both `kg` and `g`).
2. **Automatic Split Calculation**: When your required volume exceeds any single farmer's stock, the engine automatically selects multiple distinct farmers to fulfill the exact total (for example: Farmer A provides 50 kg, Farmer B provides 30 kg, and Farmer C provides 20 kg).
3. **Choose Optimization Strategy**:
   - **Balanced**: Best overall balance of distance, price, and farmer rating.
   - **Lowest Price**: Minimizes total procurement cost across all recommended lots.
   - **Fastest Delivery**: Prioritizes nearest farmers with ready stock.
4. **One-Click Order**: Click **Place Orders to All Farmers**. The system generates and dispatches individual purchase orders to each recommended farmer automatically.

---

## 🚜 Farmer Dashboard Workflow (`/farmer`)

### Workflow 1: Publishing a New Crop Listing
```text
[ Open /farmer/add ] ➔ [ Enter Crop Details ] ➔ [ Set Price & Stock ] ➔ [ Publish to Marketplace ]
```
1. **Open Listing Form**: Click **Add Produce** from the sidebar or visit `/farmer/add`.
2. **Enter Produce Information**:
   - Select crop name (e.g. Tomato, Potato, Onion).
   - Enter available quantity (in kg).
   - Select quality grade (Grade A / B / C).
   - Set your asking price per kg.
3. **Publish**: Click **Publish Listing**. Your crop immediately becomes visible to buyers in the marketplace.

---

### Workflow 2: Checking Benchmark Market Prices
```text
[ Open /farmer/prices ] ➔ [ View Mandi/APMC Rates ] ➔ [ Adjust Asking Price ]
```
1. Navigate to **Market Prices** (`/farmer/prices`) from the sidebar.
2. Check real-time APMC mandi benchmark rates to ensure your crops are priced competitively.

---

### Workflow 3: Fulfilling Incoming Buyer Orders
```text
[ View Incoming Orders ] ➔ [ Accept Order ] ➔ [ Dispatch Produce ] ➔ [ Complete Delivery ]
```
1. **Review Orders**: View incoming buyer requests on your dashboard with allocated quantities and delivery locations.
2. **Update Order Status**:
   - **Accept**: Confirms you are preparing the harvest.
   - **Dispatch**: Marks the order as in transit.
   - **Delivered**: Marks the order as successfully fulfilled.
3. **Cancellation & Auto-Restock**: If an order is cancelled, the reserved produce quantity is automatically returned back to your available inventory on the buyer marketplace.

---

## 🛠️ Admin Dashboard Workflow (`/admin`)

```text
[ Visit /admin ] ➔ [ Review Platform Metrics ] ➔ [ Monitor Produce Inventory & Activity ]
```

1. **Access Dashboard**: Open `/admin` directly in your browser.
2. **Review Metrics**: View overall platform volume, active listings count, registered farmers, and registered buyers.
3. **Monitor Inventory & Orders**: Inspect active produce lots across all farmers and oversee platform-wide transaction status.
