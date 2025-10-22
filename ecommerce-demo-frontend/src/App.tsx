import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/common/Layout';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import Home from './pages/Home';
import AdminLayout from './pages/admin/AdminLayout';
import CategoriesAdmin from './pages/admin/CategoriesAdmin';
import Products from './pages/Products';
import Checkout from './pages/Checkout';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import OrdersAdmin from './pages/admin/OrdersAdmin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/products" element={<Layout><Products /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/orders" element={<Layout><Orders /></Layout>} />
          <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="/admin/orders" element={<OrdersAdmin />} />
            </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
