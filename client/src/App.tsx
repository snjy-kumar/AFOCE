import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DashboardLayout, AuthLayout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Spinner } from './components/ui/Common';
import { I18nProvider } from './lib/i18n';

// Public Pages - Eager load
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { PricingPage } from './pages/PricingPage';
import { FeaturesPage } from './pages/FeaturesPage';

// Auth Pages - Eager load for faster initial auth
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Dashboard Pages - Lazy load for code splitting
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const CustomersPage = lazy(() => import('./pages/customers/CustomersPage').then(m => ({ default: m.CustomersPage })));
const VendorsPage = lazy(() => import('./pages/vendors/VendorsPage').then(m => ({ default: m.VendorsPage })));
const InvoicesPage = lazy(() => import('./pages/invoices/InvoicesPage').then(m => ({ default: m.InvoicesPage })));
const NewInvoicePage = lazy(() => import('./pages/invoices/NewInvoicePage').then(m => ({ default: m.NewInvoicePage })));
const EditInvoicePage = lazy(() => import('./pages/invoices/EditInvoicePage').then(m => ({ default: m.EditInvoicePage })));
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage').then(m => ({ default: m.ExpensesPage })));
const NewExpensePage = lazy(() => import('./pages/expenses/NewExpensePage').then(m => ({ default: m.NewExpensePage })));
const EditExpensePage = lazy(() => import('./pages/expenses/EditExpensePage').then(m => ({ default: m.EditExpensePage })));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage').then(m => ({ default: m.AccountsPage })));
const VatPage = lazy(() => import('./pages/vat/VatPage').then(m => ({ default: m.VatPage })));
const BankPage = lazy(() => import('./pages/bank/BankPage').then(m => ({ default: m.BankPage })));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/admin/AdminPage').then(m => ({ default: m.default })));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.default })));

// Company Pages - Lazy load
const CompaniesListPage = lazy(() => import('./pages/settings/companies/CompaniesListPage').then(m => ({ default: m.default })));
const CompanyFormPage = lazy(() => import('./pages/settings/companies/CompanyFormPage').then(m => ({ default: m.default })));
const CompanyMembersPage = lazy(() => import('./pages/settings/companies/CompanyMembersPage').then(m => ({ default: m.default })));

// Inventory Pages - Lazy load
const InventoryPage = lazy(() => import('./pages/inventory/InventoryPage').then(m => ({ default: m.default })));
const ProductFormPage = lazy(() => import('./pages/inventory/ProductFormPage').then(m => ({ default: m.default })));

// Project Pages - Lazy load
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage').then(m => ({ default: m.default })));
const ProjectFormPage = lazy(() => import('./pages/projects/ProjectFormPage').then(m => ({ default: m.default })));
const ProjectDetailPage = lazy(() => import('./pages/projects/ProjectDetailPage').then(m => ({ default: m.default })));

// Currency Page - Lazy load
const CurrencyPage = lazy(() => import('./pages/settings/CurrencyPage').then(m => ({ default: m.default })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <Spinner size="lg" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes - data stays fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: false, // Don't retry failed mutations
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/features" element={<FeaturesPage />} />

                  {/* Auth Routes */}
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                  </Route>

                  {/* Dashboard Routes - Protected */}
                  <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    {/* Customers */}
                    <Route path="/customers" element={<CustomersPage />} />

                    {/* Vendors */}
                    <Route path="/vendors" element={<VendorsPage />} />

                    {/* Invoices */}
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/invoices/new" element={<NewInvoicePage />} />
                    <Route path="/invoices/:id/edit" element={<EditInvoicePage />} />

                    {/* Expenses */}
                    <Route path="/expenses" element={<ExpensesPage />} />
                    <Route path="/expenses/new" element={<NewExpensePage />} />
                    <Route path="/expenses/:id/edit" element={<EditExpensePage />} />

                    {/* Accounts */}
                    <Route path="/accounts" element={<AccountsPage />} />

                    {/* VAT */}
                    <Route path="/vat" element={<VatPage />} />

                    {/* Bank */}
                    <Route path="/bank" element={<BankPage />} />

                    {/* Reports */}
                    <Route path="/reports" element={<ReportsPage />} />

                    {/* Analytics */}
                    <Route path="/analytics" element={<AnalyticsPage />} />

                    {/* Inventory */}
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/inventory/new" element={<ProductFormPage />} />
                    <Route path="/inventory/:id" element={<ProductFormPage />} />
                    <Route path="/inventory/:id/edit" element={<ProductFormPage />} />

                    {/* Projects */}
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/projects/new" element={<ProjectFormPage />} />
                    <Route path="/projects/:id" element={<ProjectDetailPage />} />
                    <Route path="/projects/:id/edit" element={<ProjectFormPage />} />

                    {/* Settings */}
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/currencies" element={<CurrencyPage />} />
                    <Route path="/settings/companies" element={<CompaniesListPage />} />
                    <Route path="/settings/companies/new" element={<CompanyFormPage />} />
                    <Route path="/settings/companies/:id" element={<CompanyFormPage />} />
                    <Route path="/settings/companies/:id/members" element={<CompanyMembersPage />} />

                    {/* Admin */}
                    <Route path="/admin" element={<AdminPage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ToastProvider>
        </I18nProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
