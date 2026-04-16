import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import OrderListPage from "./pages/OrderListPage";
import NewOrderForm from "./pages/NewOrderForm";
import OrderDetailsPage from "./pages/OrderDetailsPage";

function App() {
  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Sidebar />
      <main className="flex-1 ml-[220px] p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/new" element={<NewOrderForm />} />
          <Route path="/orders/:orderNumber" element={<OrderDetailsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;