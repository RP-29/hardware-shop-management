import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import ProductListPage from './features/inventory/pages/ProductListPage'
import CategoryListPage from './features/categories/pages/CategoryListPage'
import BrandListPage from './features/brands/pages/BrandListPage'
import SupplierListPage from './features/suppliers/pages/SupplierListPage'
import PurchaseListPage from './features/purchases/pages/PurchaseListPage'
import CustomerListPage from './features/customers/pages/CustomerListPage'
import SaleListPage from './features/sales/pages/SaleListPage'
import InvoicePage from './features/sales/pages/InvoicePage'
import ReceivePaymentPage from './features/payments/pages/ReceivePaymentPage'
import CategoryPage from './features/categories/pages/CategoryPage'
import BrandPage from './features/brands/pages/BrandPage'
import SettingsPage from './features/settings/pages/SettingsPage'
import ReportsPage from './features/reports/pages/ReportsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <ProductListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoryListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brands"
          element={
            <ProtectedRoute>
              <BrandListPage />
            </ProtectedRoute>
          }
        />  

          <Route
            path="/suppliers"
            element={
              <ProtectedRoute>
                <SupplierListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchaseListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomerListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <SaleListPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/invoice/:id"
            element={
              <ProtectedRoute>
                <InvoicePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/receive-payments" element={<ReceivePaymentPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
     

    </BrowserRouter>
  )
}

export default App