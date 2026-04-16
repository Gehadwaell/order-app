import { useState, useEffect, useMemo } from "react";
import { X, Package, Loader2 } from "lucide-react";
import Select from "react-select";

export default function AddLineModal({ isOpen, onClose, onSubmit, searchProducts, getProductVariants, sites, warehouses }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingVariants, setLoadingVariants] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [sizeOptions, setSizeOptions] = useState([]);
  const [styleOptions, setStyleOptions] = useState([]);
  const [configOptions, setConfigOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setSelectedSite(null);
      setSelectedWarehouse(null);
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedStyle(null);
      setSelectedConfig(null);
      setQuantity("1");
      setPrice("");
      setColorOptions([]);
      setSizeOptions([]);
      setStyleOptions([]);
      setConfigOptions([]);
      loadProducts("");
    }
  }, [isOpen]);

  const loadProducts = async (input) => {
    setLoadingProducts(true);
    const results = await searchProducts(input);
    setProductOptions(results);
    setLoadingProducts(false);
  };

  const handleInputChange = (inputValue) => {
    loadProducts(inputValue);
  };

  const handleProductChange = async (product) => {
    setSelectedProduct(product);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedStyle(null);
    setSelectedConfig(null);
    setColorOptions([]);
    setSizeOptions([]);
    setStyleOptions([]);
    setConfigOptions([]);

    if (!product) return;

    setLoadingVariants(true);
    const variants = await getProductVariants(product.value);
    setLoadingVariants(false);

    if (variants.length > 0) {
      const colors = [...new Set(variants.map((v) => v.ProductColorId).filter(Boolean))];
      const sizes = [...new Set(variants.map((v) => v.ProductSizeId).filter(Boolean))];
      const styles = [...new Set(variants.map((v) => v.ProductStyleId).filter(Boolean))];
      const configs = [...new Set(variants.map((v) => v.ProductConfigurationId).filter(Boolean))];

      setColorOptions(colors.map((c) => ({ value: c, label: c })));
      setSizeOptions(sizes.map((s) => ({ value: s, label: s })));
      setStyleOptions(styles.map((s) => ({ value: s, label: s })));
      setConfigOptions(configs.map((c) => ({ value: c, label: c })));
    }
  };

  const siteOptions = useMemo(
    () => (sites || []).map((s) => ({ value: s.SiteId, label: `${s.SiteId} - ${s.SiteName}` })),
    [sites]
  );

  const warehouseOptions = useMemo(
    () => (warehouses || []).map((w) => ({ value: w.WarehouseId, label: `${w.WarehouseId} - ${w.WarehouseName}` })),
    [warehouses]
  );

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity || !selectedSite || !selectedWarehouse) return;
    setIsSubmitting(true);
    const success = await onSubmit({
      itemNumber: selectedProduct.value,
      quantity,
      siteId: selectedSite.value,
      warehouseId: selectedWarehouse.value,
      colorId: selectedColor?.value || "",
      sizeId: selectedSize?.value || "",
      styleId: selectedStyle?.value || "",
      configId: selectedConfig?.value || "",
      price: price || undefined,
    });
    setIsSubmitting(false);
    if (success) onClose();
  };

  if (!isOpen) return null;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: "4px 4px",
      borderRadius: "0.75rem",
      backgroundColor: "white",
      border: state.isFocused ? "2px solid #3b82f6" : "1px solid #e5e7eb",
      boxShadow: "none",
      fontSize: "14px",
      fontWeight: 500,
      minHeight: "44px",
      cursor: "pointer",
      "&:hover": { borderColor: "#3b82f6" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.75rem",
      overflow: "hidden",
      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
      zIndex: 50,
    }),
    menuList: (base) => ({ ...base, maxHeight: "200px" }),
    option: (base, state) => ({
      ...base,
      padding: "10px 14px",
      fontSize: "13px",
      fontWeight: 500,
      backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
      color: state.isSelected ? "white" : "#1e293b",
      cursor: "pointer",
    }),
    placeholder: (base) => ({ ...base, color: "#9ca3af", fontWeight: 400, fontSize: "13px" }),
    singleValue: (base) => ({ ...base, color: "#1e293b", fontWeight: 500 }),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-3xl p-8 w-full max-w-[520px] shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
            <Package size={18} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">New Sales Line</h2>
        </div>

        {/* Product */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Product *</label>
          <Select
            options={productOptions}
            value={selectedProduct}
            onChange={handleProductChange}
            onInputChange={handleInputChange}
            placeholder="Search Item ID..."
            isSearchable
            isClearable
            isLoading={loadingProducts}
            styles={selectStyles}
            noOptionsMessage={() => "No products found"}
            loadingMessage={() => "Loading..."}
          />
        </div>

        {/* Site + Warehouse side by side */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Site</label>
            <Select
              options={siteOptions}
              value={selectedSite}
              onChange={(val) => { setSelectedSite(val); setSelectedWarehouse(null); }}
              placeholder="Auto / Search..."
              isSearchable
              isClearable
              styles={selectStyles}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Warehouse</label>
            <Select
              options={warehouseOptions}
              value={selectedWarehouse}
              onChange={setSelectedWarehouse}
              placeholder={selectedSite ? "Select..." : "Select Site First"}
              isSearchable
              isClearable
              isDisabled={!selectedSite}
              styles={selectStyles}
            />
          </div>
        </div>

        {/* Loading variants */}
        {loadingVariants && (
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={14} className="animate-spin text-blue-500" />
            <span className="text-xs text-gray-400">Loading variants...</span>
          </div>
        )}

        {/* Color / Size / Style / Configuration */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Color</label>
            {colorOptions.length > 0 ? (
              <Select options={colorOptions} value={selectedColor} onChange={setSelectedColor} placeholder="Select Color" isClearable styles={selectStyles} />
            ) : (
              <div className="h-[44px] bg-gray-50 rounded-xl flex items-center px-4 text-sm text-gray-400 border border-gray-100">N/A</div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Size</label>
            {sizeOptions.length > 0 ? (
              <Select options={sizeOptions} value={selectedSize} onChange={setSelectedSize} placeholder="Select Size" isClearable styles={selectStyles} />
            ) : (
              <div className="h-[44px] bg-gray-50 rounded-xl flex items-center px-4 text-sm text-gray-400 border border-gray-100">N/A</div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Style</label>
            {styleOptions.length > 0 ? (
              <Select options={styleOptions} value={selectedStyle} onChange={setSelectedStyle} placeholder="Select Style" isClearable styles={selectStyles} />
            ) : (
              <div className="h-[44px] bg-gray-50 rounded-xl flex items-center px-4 text-sm text-gray-400 border border-gray-100">N/A</div>
            )}
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Configuration</label>
            {configOptions.length > 0 ? (
              <Select options={configOptions} value={selectedConfig} onChange={setSelectedConfig} placeholder="Select Config" isClearable styles={selectStyles} />
            ) : (
              <div className="h-[44px] bg-gray-50 rounded-xl flex items-center px-4 text-sm text-gray-400 border border-gray-100">N/A</div>
            )}
          </div>
        </div>

        {/* Quantity + Unit Price side by side */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Quantity *</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full h-[44px] px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Unit Price</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Auto-Calculate"
              className="w-full h-[44px] px-4 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3.5 rounded-2xl font-semibold text-gray-400 hover:bg-gray-50 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProduct || !selectedSite || !selectedWarehouse || !quantity}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? "Pushing to D365..." : "Confirm Line"}
          </button>
        </div>
      </div>
    </div>
  );
}