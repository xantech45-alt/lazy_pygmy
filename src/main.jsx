import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

// Bootstrap 5 CSS + Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// App styles (verbatim ports from assets/css)
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/tables.css';
import './styles/forms.css';
import './styles/pages.css';
import './styles/responsive.css';
import './styles/print.css';

import { ToastProvider } from './components/ToastProvider.jsx';
import { OrderDraftProvider } from './data-access/useOrderDraft.jsx';
import { UserProfileProvider } from './state/UserProfileContext.jsx';
import { AppSettingsProvider } from './state/AppSettingsContext.jsx';
import router from './router.jsx';

// Provider order (outermost → innermost):
//   ToastProvider        — universal toast surface; available everywhere
//   UserProfileProvider  — identity (phase 1); OrderDraft may read role
//   AppSettingsProvider  — workspace prefs (phase 1); Settings UI in phase 4
//   OrderDraftProvider   — in-flight order wizard (phase 5)
//   RouterProvider       — routes, including the existing RequireAuth guard
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <UserProfileProvider>
        <AppSettingsProvider>
          <OrderDraftProvider>
            <RouterProvider router={router} />
          </OrderDraftProvider>
        </AppSettingsProvider>
      </UserProfileProvider>
    </ToastProvider>
  </React.StrictMode>
);
