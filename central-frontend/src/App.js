import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import inventoryClient from "./ApolloClient/ApolloClientInventory";
import orderClient from "./ApolloClient/ApolloClientOrder";
import userClient from './ApolloClient/ApolloClientUser';

// Components
import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import AboutPage from "./components/About";
import ProfilePage from "./components/ProfilePage";
import CartPage from './components/CartPage/CartPage';

// Buyer Pages
import BuyerProductCatalog from "./components/BuyerPages/BuyerProductCatalog";
import BuyerProductDetails from "./components/BuyerPages/BuyerProductDetails";
import BuyerOrdersList from "./components/BuyerPages/BuyerOrderList"; // ✅ Import BuyerOrdersList
import BuyerOrderDetails from "./components/BuyerPages/BuyerOrderDetails"; // ✅ Import BuyerOrderDetails

// Seller Pages
import SellerInventory from "./components/SellerPages/SellerInventory";
import SellerDashboard from "./components/SellerPages/SellerDashboard";
import SellerOrdersPage from "./components/SellerPages/SellerOrdersPage";
import SellerOrderDetail from "./components/SellerPages/SellerOrderDetail";
import RegisterSeller from "./components/SellerPages/RegisterSeller";

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
      {!hideHeaderPaths.includes(location.pathname) && (
        <ApolloProvider client={userClient}>
          <Header />
        </ApolloProvider>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Seller-only routes */}
        <Route
          path="/seller/register"
          element={
            <PrivateRoute>
              <RegisterSeller />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ApolloProvider client={inventoryClient}>
              <RoleBasedRoute allowedRoles={["seller"]}>
                <SellerDashboard />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/inventory"
          element={
            <ApolloProvider client={inventoryClient}>
              <RoleBasedRoute allowedRoles={["seller"]}>
                <SellerInventory />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/seller/orders"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={["seller"]}>
                <SellerOrdersPage />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />
        <Route
          path="/seller/orders/:orderId"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={["seller"]}>
                <SellerOrderDetail />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />

        {/* Buyer-only routes */}
        <Route
          path="/catalog"
          element={
            <ApolloProvider client={inventoryClient}>
              <RoleBasedRoute allowedRoles={["buyer"]}>
              <BuyerProductCatalog />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />

        <Route
          path="/catalog/:id"
          element={
            <ApolloProvider client={inventoryClient}>
              <BuyerProductDetails />
            </ApolloProvider>
          }
        />

        <Route
          path="/orders"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={["buyer"]}>
                <BuyerOrdersList />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ApolloProvider client={orderClient}>
              <RoleBasedRoute allowedRoles={["buyer"]}>
                <BuyerOrderDetails />
              </RoleBasedRoute>
            </ApolloProvider>
          }
        />

        <Route
          path="/cart"
          element={
            <RoleBasedRoute allowedRoles={["buyer"]}>
              <CartPage  />
            </RoleBasedRoute>
          }
        />

        
        {/* Profile Page wrapped with UserApolloClient */}
        <Route
          path="/profile"
          element={
            <ApolloProvider client={userClient}>
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            </ApolloProvider>
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
