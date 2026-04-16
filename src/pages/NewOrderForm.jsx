import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import Select from "react-select";
import { useOrders } from "../hooks/useOrders";

export default function NewOrderForm() {
  const navigate = useNavigate();
  const { customers, currencies, createOrder, loading } = useOrders();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);

  // Build react-select options from API data
  const customerOptions = useMemo(
    () =>
      customers.map((c) => ({
        value: c.CustomerAccount,
        label: `${c.CustomerAccount} - ${c.NameAlias || "No Name"}`,
      })),
    [customers]
  );

  const currencyOptions = useMemo(
    () =>
      currencies.map((c) => ({
        value: c.CurrencyCode,
        label: `${c.CurrencyCode} - ${c.Name || ""}`,
      })),
    [currencies]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !selectedCurrency) return;
    setIsSubmitting(true);
    const success = await createOrder({
      customerAccount: selectedCustomer.value,
      currencyCode: selectedCurrency.value,
    });
    setIsSubmitting(false);
    if (success) navigate("/orders");
  };

  // Custom styles for react-select to match the design
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: "8px 8px",
      borderRadius: "1rem",
      backgroundColor: "#F8FAFC",
      border: state.isFocused ? "2px solid #0052FF" : "2px solid transparent",
      boxShadow: "none",
      fontSize: "14px",
      fontWeight: 600,
      cursor: "pointer",
      "&:hover": { borderColor: "#0052FF" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
      zIndex: 50,
    }),
    option: (base, state) => ({
      ...base,
      padding: "12px 16px",
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: state.isSelected
        ? "#0052FF"
        : state.isFocused
        ? "#EEF2FF"
        : "white",
      color: state.isSelected ? "white" : "#1e293b",
      cursor: "pointer",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#94a3b8",
      fontWeight: 500,
    }),
    singleValue: (base) => ({
      ...base,
      color: "#1e293b",
      fontWeight: 600,
    }),
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={32} className="animate-spin text-orange-500 mb-3" />
        <p className="text-sm text-gray-400">Loading form data...</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/orders")}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-8 transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-gray-50 max-w-2xl w-full mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">
            Create Sales Order
          </h2>
          <p className="text-slate-400 font-medium">
            Auto-generates ID and links to Sandbox Master Data.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer – searchable dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Customer *
            </label>
            <Select
              options={customerOptions}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Search or select a Customer..."
              isSearchable
              styles={selectStyles}
              noOptionsMessage={() => "No customers found"}
            />
          </div>

          {/* Currency – searchable dropdown */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Currency *
            </label>
            <Select
              options={currencyOptions}
              value={selectedCurrency}
              onChange={setSelectedCurrency}
              placeholder="Search or select Currency..."
              isSearchable
              styles={selectStyles}
              noOptionsMessage={() => "No currencies found"}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/orders")}
              disabled={isSubmitting}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCustomer || !selectedCurrency}
              className="flex-1 bg-[#0052FF] hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Processing..." : "Submit Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}