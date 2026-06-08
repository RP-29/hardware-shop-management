# Hardware Shop Management System

A modern Hardware Shop Management System built with React, TypeScript, and Vite to streamline inventory management, sales tracking, customer management, reporting, and day-to-day hardware store operations.

## 🚀 Features

### Inventory Management

* Add, edit, and delete products
* Product categorization
* Stock monitoring and tracking
* Low-stock alerts
* Barcode support for products

### Sales Management

* Create and manage invoices
* Record sales transactions
* Generate bills and receipts
* Track daily, weekly, and monthly sales

### Customer Management

* Maintain customer records
* Purchase history tracking
* Customer information management

### Reporting & Analytics

* Sales reports
* Inventory reports
* Business performance dashboard
* Data visualization using charts

### Import / Export

* Excel file import support
* Excel export functionality
* PDF report generation

### Authentication & Data Storage

* Secure authentication
* Cloud database integration using Supabase
* Real-time data synchronization

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite

### State Management

* Zustand

### Backend & Database

* Supabase

### UI & Visualization

* Recharts
* Lucide React Icons

### Utilities

* XLSX
* jsPDF
* html2canvas
* React Barcode

### Code Quality

* ESLint

---

## 📂 Project Structure

```text
hardware-shop-management/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── utils/
│   ├── types/
│   └── assets/
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── components.json
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

* Node.js (v18 or later)
* npm or yarn
* Supabase account

### Clone Repository

```bash
git clone https://github.com/RP-29/hardware-shop-management.git
cd hardware-shop-management
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Application will be available at:

```text
http://localhost:5173
```

---

## 🏗️ Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 📊 Dashboard Capabilities

The dashboard provides insights into:

* Total sales
* Revenue tracking
* Inventory status
* Product performance
* Customer activity
* Business analytics

---

## 📦 Inventory Workflow

1. Add products to inventory
2. Assign categories and stock quantities
3. Generate barcodes
4. Track stock movements
5. Receive low-stock notifications
6. Export inventory reports

---

## 🧾 Sales Workflow

1. Select customer
2. Add products to cart
3. Generate invoice
4. Complete transaction
5. Print or export receipt
6. Store sales record

---

## 📤 Export Features

### Excel Export

Export:

* Products
* Inventory
* Sales records
* Customer data

### PDF Export

Generate:

* Invoices
* Sales reports
* Inventory summaries

---

## 🔐 Security

* Secure authentication
* Environment-based configuration
* Protected API access
* Supabase Row Level Security (RLS) support

---

## 🧪 Available Scripts

```bash
npm run dev
```

Runs the application in development mode.

```bash
npm run build
```

Builds the application for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint checks.

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/new-feature
```

3. Commit changes

```bash
git commit -m "Add new feature"
```

4. Push branch

```bash
git push origin feature/new-feature
```

5. Open a Pull Request

---

## 📈 Future Enhancements

* Supplier management
* Purchase order management
* GST/VAT support
* Multi-store support
* Mobile application
* Advanced analytics
* Automated stock forecasting
* Email notifications

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**RP-29**

GitHub: https://github.com/RP-29

---

### ⭐ Support

If you find this project useful, please consider giving it a star on GitHub.
