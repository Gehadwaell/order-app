import { useNavigate } from "react-router-dom";

const statusStyles = {
  Active: { label: "OPEN", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  Open: { label: "OPEN", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  Invoiced: { label: "INVOICED", bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  Confirmed: { label: "CONFIRMED", bg: "bg-green-50", text: "text-green-600", border: "border-green-200" },
  Delivered: { label: "DELIVERED", bg: "bg-green-500", text: "text-white", border: "border-green-500" },
  Cancelled: { label: "CANCELLED", bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
};

export default function OrderCard({ order }) {
  const navigate = useNavigate();
  const style = statusStyles[order.status] || statusStyles.Active;

  return (
    <div
      onClick={() => navigate(`/orders/${order.id}`)}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest">SALES ORDER</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{order.id}</h2>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
          {style.label}
        </span>
      </div>

      {/* Customer Account */}
      <div className="border border-gray-200 rounded-xl px-4 py-3">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest">CUSTOMER ACCOUNT</p>
        <p className="text-base font-bold text-gray-900 mt-0.5">{order.customerAccount || "—"}</p>
      </div>

      {/* Customer Name */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest">CUSTOMER NAME</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{order.customerName || "—"}</p>
      </div>

      {/* Bottom row */}
      <div className="flex items-center gap-6 pt-2 border-t border-gray-100">
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-gray-300 tracking-widest">ORDER TYPE</p>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-gray-300 tracking-widest">INVOICE ACCOUNT</p>
          <p className="text-xs text-gray-500 mt-0.5">{order.invoiceAccount || "—"}</p>
        </div>
      </div>
    </div>
  );
}