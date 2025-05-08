import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client as inventoryClient } from "./ApolloClient/ApolloClientInventory";
import { client as orderClient } from "./ApolloClient/ApolloClientOrder";

// Components
import Header from "./components/Header";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import AboutPage from "./components/About";

// Buyer Pages (REST-based)
import BuyerProductCatalog from "./components/BuyerPages/BuyerProductCatalog";
import BuyerProductDetails from "./components/BuyerPages/BuyerProductDetail";

// Seller Pages (still Apollo-based)
import SellerInventory from "./components/SellerPages/SellerInventory";
import SellerDashboard from "./components/SellerPages/SellerDashboard";
import SellerOrdersPage from "./components/SellerPages/SellerOrdersPage";
import SellerOrderDetail from "./components/SellerPages/SellerOrderDetail";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

// Optional: Unauthorized fallback
import UnauthorizedPage from "./components/UnauthorizedPage";

function AppContent() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/register"];

  return (
    <>
      {/* Conditionally hide the Header */}
      {!hideHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Seller-only routes */}
        <Route
          path="/dashboard"
          element={
            <ApolloProvider client={inventoryClient}>
              <RoleBasedRoute allowedRoles={['seller']}>
                <SellerDashboard />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/inventory"
          element={
            <ApolloProvider client={inventoryClient}>
              <RoleBasedRoute allowedRoles={['seller']}>
                <SellerInventory />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={['seller']}>
                <SellerOrdersPage />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/seller/orders/:orderId"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={['seller']}>
                <SellerOrderDetail />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        {/* <Route
          path="/seller/orders/:orderId"
          element={
            <RoleBasedRoute allowedRoles={['seller']}>
              <SellerOrderDetail />
            </RoleBasedRoute>
          }
        /> */}

        {/* Buyer-only routes (REST-based) */}
        <Route
          path="/catalog"
          element={
            <RoleBasedRoute allowedRoles={['buyer']}>
              <BuyerProductCatalog />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/catalog/:id"
          element={
            <RoleBasedRoute allowedRoles={['buyer']}>
              <BuyerProductDetails />
            </RoleBasedRoute>
          }
        />

        {/* General private route */}
        <Route
          path="/about"
          element={
            <PrivateRoute>
              <AboutPage />
            </PrivateRoute>
          }
        />

        {/* Unauthorized fallback */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
      <Router>
        <AppContent />
      </Router>
  );
}

export default App;
