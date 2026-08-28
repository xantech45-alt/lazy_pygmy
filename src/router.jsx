import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import SignIn from './routes/auth/SignIn.jsx';
import ForgotPassword from './routes/auth/ForgotPassword.jsx';
import Register from './routes/auth/Register.jsx';
import VerifyResetCode from './routes/auth/VerifyResetCode.jsx';
import ResetPassword from './routes/auth/ResetPassword.jsx';
import Dashboard from './routes/dashboard/Dashboard.jsx';
import Reports from './routes/dashboard/Reports.jsx';
import Settings from './routes/dashboard/Settings.jsx';
import ProductList from './routes/products/ProductList.jsx';
import ProductCategories from './routes/products/ProductCategories.jsx';
import ProductCreate from './routes/products/ProductCreate.jsx';
import ProductDetail from './routes/products/ProductDetail.jsx';
import ProductEdit from './routes/products/ProductEdit.jsx';
import ProductHistory from './routes/products/ProductHistory.jsx';
import OrderCreate from './routes/orders/OrderCreate.jsx';
import OrderProducts from './routes/orders/OrderProducts.jsx';
import OrderReview from './routes/orders/OrderReview.jsx';
import Analytics from './routes/dashboard/Analytics.jsx';
import Notifications from './routes/dashboard/Notifications.jsx';
import InventoryIndex from './routes/inventory/InventoryIndex.jsx';
import InventoryLowStock from './routes/inventory/InventoryLowStock.jsx';
import InventoryAdjustment from './routes/inventory/InventoryAdjustment.jsx';
import InventoryMovements from './routes/inventory/InventoryMovements.jsx';
import InventoryReceipts from './routes/inventory/InventoryReceipts.jsx';
import InventoryReceiptDetail from './routes/inventory/InventoryReceiptDetail.jsx';
import WarehouseIndex from './routes/warehouses/WarehouseIndex.jsx';
import WarehouseCreate from './routes/warehouses/WarehouseCreate.jsx';
import WarehouseDetail from './routes/warehouses/WarehouseDetail.jsx';
import WarehouseInventory from './routes/warehouses/WarehouseInventory.jsx';
import TransferCreate from './routes/warehouses/TransferCreate.jsx';
import TransferDetail from './routes/warehouses/TransferDetail.jsx';
import SupplierIndex from './routes/suppliers/SupplierIndex.jsx';
import SupplierCreate from './routes/suppliers/SupplierCreate.jsx';
import SupplierDetail from './routes/suppliers/SupplierDetail.jsx';
import SupplierProducts from './routes/suppliers/SupplierProducts.jsx';
import SupplierPerformance from './routes/suppliers/SupplierPerformance.jsx';
import PurchaseOrderIndex from './routes/purchase-orders/PurchaseOrderIndex.jsx';
import PurchaseOrderCreate from './routes/purchase-orders/PurchaseOrderCreate.jsx';
import PurchaseOrderReceive from './routes/purchase-orders/PurchaseOrderReceive.jsx';
import PurchaseOrderDetail from './routes/purchase-orders/PurchaseOrderDetail.jsx';
import SchoolIndex from './routes/schools/SchoolIndex.jsx';
import SchoolCreate from './routes/schools/SchoolCreate.jsx';
import SchoolDetail from './routes/schools/SchoolDetail.jsx';
import SchoolOrders from './routes/schools/SchoolOrders.jsx';
import Profile from './routes/account/Profile.jsx';
import OrderIndex from './routes/orders/OrderIndex.jsx';
import OrderDetail from './routes/orders/OrderDetail.jsx';
import OrderProcessing from './routes/orders/OrderProcessing.jsx';
import OrderDeliveries from './routes/orders/OrderDeliveries.jsx';
import OrderReturn from './routes/orders/OrderReturn.jsx';
import EmployeeIndex from './routes/employees/EmployeeIndex.jsx';
import EmployeeCreate from './routes/employees/EmployeeCreate.jsx';
import EmployeeDetail from './routes/employees/EmployeeDetail.jsx';
import EmployeeEdit from './routes/employees/EmployeeEdit.jsx';
import EmployeeRoles from './routes/employees/EmployeeRoles.jsx';

/**
 * Auth gate — mirrors the simulated sign-in redirect from index.html.
 * No real auth; checks the `lp_auth` flag set by SignIn.
 */
function RequireAuth({ children }) {
  const authed = typeof window !== 'undefined' && localStorage.getItem('lp_auth') === '1';
  if (!authed) return <Navigate to="/sign-in" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: '/sign-in', element: <SignIn /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/verify-reset-code', element: <VerifyResetCode /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  {
    path: '/',
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      // Dashboard / Analytics / Notifications / Reports / Settings
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },

      // Account / Profile (Phase 3)
      { path: 'profile', element: <Profile /> },

      // Products
      { path: 'products', element: <ProductList /> },
      { path: 'products/categories', element: <ProductCategories /> },
      { path: 'products/new', element: <ProductCreate /> },
      { path: 'products/:sku', element: <ProductDetail /> },
      { path: 'products/:sku/edit', element: <ProductEdit /> },
      { path: 'products/:sku/history', element: <ProductHistory /> },

      // Inventory
      { path: 'inventory', element: <InventoryIndex /> },
      { path: 'inventory/low-stock', element: <InventoryLowStock /> },
      { path: 'inventory/adjustment', element: <InventoryAdjustment /> },
      { path: 'inventory/movements', element: <InventoryMovements /> },
      { path: 'inventory/receipts', element: <InventoryReceipts /> },
      { path: 'inventory/receipts/:receiptId', element: <InventoryReceiptDetail /> },

      // Warehouses
      { path: 'warehouses', element: <WarehouseIndex /> },
      { path: 'warehouses/new', element: <WarehouseCreate /> },
      { path: 'warehouses/:code', element: <WarehouseDetail /> },
      { path: 'warehouses/:code/inventory', element: <WarehouseInventory /> },
      { path: 'warehouses/transfers/new', element: <TransferCreate /> },
      { path: 'warehouses/transfers/:id', element: <TransferDetail /> },

      // Suppliers
      { path: 'suppliers', element: <SupplierIndex /> },
      { path: 'suppliers/new', element: <SupplierCreate /> },
      { path: 'suppliers/:code', element: <SupplierDetail /> },
      { path: 'suppliers/:code/products', element: <SupplierProducts /> },
      { path: 'suppliers/:code/performance', element: <SupplierPerformance /> },

      // Purchase Orders
      { path: 'purchase-orders', element: <PurchaseOrderIndex /> },
      { path: 'purchase-orders/new', element: <PurchaseOrderCreate /> },
      { path: 'purchase-orders/:po', element: <PurchaseOrderDetail /> },
      { path: 'purchase-orders/:po/receive', element: <PurchaseOrderReceive /> },

      // Schools
      { path: 'schools', element: <SchoolIndex /> },
      { path: 'schools/new', element: <SchoolCreate /> },
      { path: 'schools/:code', element: <SchoolDetail /> },
      { path: 'schools/:code/orders', element: <SchoolOrders /> },

      // Orders — all routes wired
      { path: 'orders', element: <OrderIndex /> },
      { path: 'orders/new', element: <OrderCreate /> },
      { path: 'orders/new/products', element: <OrderProducts /> },
      { path: 'orders/new/review', element: <OrderReview /> },
      { path: 'orders/:order', element: <OrderDetail /> },
      { path: 'orders/:order/processing', element: <OrderProcessing /> },
      { path: 'orders/deliveries', element: <OrderDeliveries /> },
      { path: 'orders/:order/return', element: <OrderReturn /> },

      // Employees
      { path: 'employees', element: <EmployeeIndex /> },
      { path: 'employees/new', element: <EmployeeCreate /> },
      { path: 'employees/:number', element: <EmployeeDetail /> },
      { path: 'employees/:number/edit', element: <EmployeeEdit /> },
      { path: 'employees/roles', element: <EmployeeRoles /> },
    ],
  },
]);

export default router;
