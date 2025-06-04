# 🛍️ React Admin Dashboard

This is a modern **admin dashboard** built using [React](https://reactjs.org/) and powered by `npm`. The application integrates with third-party services such as [Loystar](https://loystar.co/) for product management and uses Firebase for data storage.

---

## 🚀 Features

- Built with **Next.js** and **React**
- Integrates with **Loystar API** to manage products
- Uses **Firebase** to persist and organize product data
- Automated product syncing between Loystar and Firebase
- Environment-based configuration for dynamic deployment

---

## 📦 Getting Started

### Prerequisites

- Node.js v18 or later
- npm (Node Package Manager)

### Installation

```bash
git clone https://github.com/your-username/your-react-app.git
cd your-nextjs-app
npm install
```

Create a .env.local file at the root of the project and include the following variables:

NEXT_PUBLIC_MERCHANT_ID=your-loystar-merchant-id

NEXT_PUBLIC_LOYSTAR_BASE_URL=https://api.loystar.co


### Important:

NEXT_PUBLIC_MERCHANT_ID is crucial and is linked to your specific Loystar account. It only changes when a new Loystar account is created.

These variables are exposed on the frontend and should not contain sensitive secrets.

### Product Synchronization Workflow

A unique feature of this application is its real-time synchronization of products between Loystar and Firebase.

Here’s how the process works on every page load:

Fetch Products from Loystar
The app calls Loystar’s product endpoint:

GET {NEXT_PUBLIC_LOYSTAR_BASE_URL}/endpoint/product

Fetch Products and Categories from Firebase

Existing product and category data are retrieved from Firebase.

Compare and Sync Data

Products from Loystar are compared with those in Firebase.

If any product from Loystar does not exist in Firebase, it is added to Firebase with a unique loystarId field for tracking.

If a product exists in both, but has differences in quantity, price, or custom unit, the Firebase record is updated accordingly.

Display Updated Product List
After syncing, a fresh and accurate list of all products is generated and displayed to the user.


