import { Search, Plus, Loader2 } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import OrderCard from "../components/OrderCard";
import Pagination from "../components/Pagination";

export default function OrderListPage() {
  const {
    orders,
    totalItems,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  } = useOrders();

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sales Orders</h1>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 pr-4 py-3 w-80 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-gray-400"
            />
          </div>

         <button onClick={() => window.location.href = '/orders/new'} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition">
            New Order
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 size={32} className="animate-spin text-orange-500 mb-3" />
          <p className="text-sm text-gray-400">Loading orders from D365...</p>
        </div>
      )}

      {/* Empty */}
      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <p className="text-lg font-semibold text-gray-800 mb-1">No orders found</p>
          <p className="text-sm text-gray-400">Try adjusting your search.</p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && orders.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <Pagination
            page={currentPage}
            totalPages={totalPages}
            total={totalItems}
            pageSize={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}