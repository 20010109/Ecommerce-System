import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { client } from "./ApolloClient"; // Apollo client configured for Hasura

// Components
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import AboutPage from "./components/About";

// Buyer Pages
import ProductCatalog from "./components/BuyerPages/BuyerProductCatalog";
import ProductDetail from "./components/BuyerPages/BuyerProductDetail";

// Seller Pages
import SellerInventory from "./components/SellerPages/SellerInventory";
import SellerDashboard from "./components/SellerPages/SellerDashboard";
import SellerOrdersPage from "./components/SellerPages/SellerOrdersPage";
import SellerOrderDetail from "./components/SellerPages/SellerOrderDetail";

// Routes
import PrivateRoute from "./routes/PrivateRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

// Optional: You might want an UnauthorizedPage if users hit a restricted route
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
            <RoleBasedRoute allowedRoles={['seller']}>
              <SellerDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <RoleBasedRoute allowedRoles={['seller']}>
              <SellerInventory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <RoleBasedRoute allowedRoles={['seller']}>
              <SellerOrdersPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/seller/orders/:orderId"
          element={
            <RoleBasedRoute allowedRoles={['seller']}>
              <SellerOrderDetail />
            </RoleBasedRoute>
          }
        />

        {/* Buyer-only routes */}
        <Route
          path="/catalog"
          element={
            <RoleBasedRoute allowedRoles={['buyer']}>
              <ProductCatalog />
            </RoleBasedRoute>
          }
        />
        <Route
          path="/catalog/:id"
          element={
            <RoleBasedRoute allowedRoles={['buyer']}>
              <ProductDetail />
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
    <ApolloProvider client={client}>
      <Router>
        <AppContent />
      </Router>
    </ApolloProvider>
  );
}

export default App;
