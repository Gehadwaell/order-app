import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useOrders } from "../hooks/useOrders";
import AddLineModal from "../components/AddLineModal";

const statusStyles = {
  Active: { label: "OPEN", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Open: { label: "OPEN", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  Invoiced: { label: "INVOICED", bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  Confirmed: { label: "CONFIRMED", bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  Delivered: { label: "DELIVERED", bg: "bg-green-500", text: "text-white", border: "border-green-500" },
  Cancelled: { label: "CANCELLED", bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
};

export default function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { lines, linesLoading, fetchOrderLines, createOrderLine, searchProducts, getProductVariants, sites, warehouses, loading } = useOrders();

  const [header, setHeader] = useState(null);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [showAddLine, setShowAddLine] = useState(false);

  useEffect(() => {
    const fetchHeader = async () => {
      setHeaderLoading(true);
      try {
        const res = await fetch(
          `/api-data/data/SalesOrderHeadersV3?cross-company=true&$filter=SalesOrderNumber eq '${orderNumber}'&$select=SalesOrderNumber,SalesOrderName,SalesOrderProcessingStatus,OrderingCustomerAccountNumber,InvoiceCustomerAccountNumber`,
          { headers: { Accept: "application/json" } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.value && data.value.length > 0) setHeader(data.value[0]);
        }
      } catch (err) {
        console.error("Header fetch error:", err);
      } finally {
        setHeaderLoading(false);
      }
    };
    fetchHeader();
  }, [orderNumber]);

  useEffect(() => {
    if (orderNumber) fetchOrderLines(orderNumber);
  }, [orderNumber, fetchOrderLines]);

  const handleAddLine = async (lineData) => {
    return await createOrderLine(orderNumber, lineData);
  };

  if (headerLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-orange-500 mb-3" />
        <p className="text-sm text-gray-400">Loading order details...</p>
      </div>
    );
  }

  const status = header?.SalesOrderProcessingStatus || "Active";
  const style = statusStyles[status] || statusStyles.Active;

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 font-medium transition"
        >
          <ArrowLeft size={16} />
          Back to Sales Orders
        </button>

        <button
          onClick={() => setShowAddLine(true)}
          disabled={status === "Invoiced"}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition ${
            status === "Invoiced"
              ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
          }`}
        >
          <Plus size={18} />
          Add Line Item
        </button>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-8 text-[120px] font-black text-gray-100/60 leading-none select-none pointer-events-none">
          ERP
        </div>
        <p className="text-[10px] font-bold text-orange-500 tracking-widest mb-2 relative z-10">HEADER INFORMATION</p>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-8 relative z-10">{orderNumber}</h1>

        <div className="grid grid-cols-4 gap-6 relative z-10">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-1">CUSTOMER ACCOUNT</p>
            <p className="text-sm font-bold text-gray-800">{header?.OrderingCustomerAccountNumber || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-1">CUSTOMER NAME</p>
            <p className="text-sm font-bold text-gray-800">{header?.SalesOrderName || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-1">INVOICE ACCOUNT</p>
            <p className="text-sm font-bold text-gray-800">{header?.InvoiceCustomerAccountNumber || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest mb-1">STATUS</p>
            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
              {style.label}
            </span>
          </div>
        </div>
      </div>

      {/* Order Line Items */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Line Items</h2>
        <p className="text-[10px] font-bold text-orange-500 tracking-widest">LINKED RECORDS: {lines.length}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">ITEM ID</th>
              <th className="text-left text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">DESCRIPTION</th>
              <th className="text-left text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">COLOR/SIZE/STYLE</th>
              <th className="text-left text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">SITE / WH</th>
              <th className="text-center text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">QTY</th>
              <th className="text-right text-[10px] font-bold text-gray-400 tracking-widest px-6 py-4">PRICE</th>
            </tr>
          </thead>
          <tbody>
            {linesLoading && (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <Loader2 size={24} className="animate-spin text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Loading lines...</p>
                </td>
              </tr>
            )}

            {!linesLoading && lines.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-16">
                  <p className="text-sm text-gray-400 italic">No lines found for this order.</p>
                </td>
              </tr>
            )}

            {!linesLoading && lines.map((line, idx) => {
              const color = line.ProductColorId || "-";
              const size = line.ProductSizeId || "-";
              const styleVal = line.ProductStyleId || "-";
              const site = line.ShippingSiteId || "-";
              const wh = line.ShippingWarehouseId || "-";

              return (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{line.ItemNumber || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{line.LineDescription || "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{color} / {size} / {styleVal}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{site} / {wh}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 text-center font-semibold">{line.OrderedSalesQuantity || 0}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">${line.SalesPrice || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Line Modal */}
<AddLineModal
        isOpen={showAddLine}
        onClose={() => setShowAddLine(false)}
        onSubmit={handleAddLine}
        searchProducts={searchProducts}
        getProductVariants={getProductVariants}
        sites={sites}
        warehouses={warehouses}
      />
    </div>
  );
}