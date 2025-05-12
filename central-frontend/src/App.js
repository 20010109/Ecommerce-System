import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import inventoryClient from "./ApolloClient/ApolloClientInventory";
import orderClient from "./ApolloClient/ApolloClientOrder";
import userClient from "./ApolloClient/ApolloClientUser";
import paymentClient from "./ApolloClient/ApolloClientPayment";

import Header from "./components/Header/Header";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import AboutPage from "./components/About";
import ProfilePage from "./components/ProfilePage";
import CartPage from './components/CartPage/CartPage';

import BuyerProductCatalog from "./components/BuyerPages/BuyerProductCatalog";
import BuyerProductDetails from "./components/BuyerPages/BuyerProductDetails";
import BuyerOrdersList from "./components/BuyerPages/BuyerOrderList";
import BuyerOrderDetails from "./components/BuyerPages/BuyerOrderDetails";
import CheckoutPage from "./components/BuyerPages/CheckoutPage"; 

import SellerInventory from "./components/SellerPages/SellerInventory";
import SellerDashboard from "./components/SellerPages/SellerDashboard";
import SellerOrdersPage from "./components/SellerPages/SellerOrdersPage";
import SellerOrderDetail from "./components/SellerPages/SellerOrderDetail";
import RegisterSeller from "./components/SellerPages/RegisterSeller";

import PrivateRoute from "./routes/PrivateRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";
import UnauthorizedPage from "./components/UnauthorizedPage";

function AppContent() {
  const location = useLocation();
  const hideHeaderPaths = ["/", "/register"];

  return (
    <>
      {!hideHeaderPaths.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Seller-only routes */}
        <Route path="/seller/register" element={<PrivateRoute><RegisterSeller /></PrivateRoute>} />
        <Route path="/dashboard" element={<ApolloProvider client={inventoryClient}><RoleBasedRoute allowedRoles={["seller"]}><SellerDashboard /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/inventory" element={<ApolloProvider client={inventoryClient}><RoleBasedRoute allowedRoles={["seller"]}><SellerInventory /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/seller/orders" element={<ApolloProvider client={orderClient}><RoleBasedRoute allowedRoles={["seller"]}><SellerOrdersPage /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/seller/orders/:orderId" element={<ApolloProvider client={orderClient}><RoleBasedRoute allowedRoles={["seller"]}><SellerOrderDetail /></RoleBasedRoute></ApolloProvider>} />

        {/* Buyer-only routes */}
        <Route path="/catalog" element={<ApolloProvider client={inventoryClient}><RoleBasedRoute allowedRoles={["buyer"]}><BuyerProductCatalog /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/catalog/:id" element={<ApolloProvider client={inventoryClient}><BuyerProductDetails /></ApolloProvider>} />
        <Route path="/orders" element={<ApolloProvider client={orderClient}><RoleBasedRoute allowedRoles={["buyer"]}><BuyerOrdersList /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/orders/:id" element={<ApolloProvider client={orderClient}><RoleBasedRoute allowedRoles={["buyer"]}><BuyerOrderDetails /></RoleBasedRoute></ApolloProvider>} />
        <Route path="/cart" element={<ApolloProvider client={orderClient}><RoleBasedRoute allowedRoles={["buyer"]}><CartPage /></RoleBasedRoute></ApolloProvider>} />

        {/* ✅ NEW: Buyer Place Order Page */}
        <Route path="/place-order" element={<RoleBasedRoute allowedRoles={["buyer"]}><CheckoutPage /></RoleBasedRoute>} />

        {/* Profile + About */}
        <Route path="/profile" element={<ApolloProvider client={userClient}><PrivateRoute><ProfilePage /></PrivateRoute></ApolloProvider>} />
        <Route path="/about" element={<PrivateRoute><AboutPage /></PrivateRoute>} />

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <React.Suspense fallback={<div>Loading...</div>}>
        <AppContent />
      </React.Suspense>
    </Router>
  );
}
