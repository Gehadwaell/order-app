import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export const useOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [sites, setSites] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [lines, setLines] = useState([]);
  const [linesLoading, setLinesLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // --- Fetch order lines ---
  const fetchOrderLines = useCallback(async (orderId) => {
    if (!orderId) return;
    setLinesLoading(true);
    try {
      const res = await fetch(
        `/api-data/data/SalesOrderLinesV3?cross-company=true&$filter=SalesOrderNumber eq '${orderId}'&$select=ItemNumber,LineDescription,OrderedSalesQuantity,SalesPrice,ShippingSiteId,ShippingWarehouseId,ProductColorId,ProductSizeId,ProductStyleId`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        setLines(data.value || []);
      }
    } catch (err) {
      console.error("Fetch Lines Error:", err);
    } finally {
      setLinesLoading(false);
    }
  }, []);

  // --- Search products ---
  const searchProducts = useCallback(async (inputValue) => {
    try {
      let url = `/api-data/data/ReleasedProductsV2?cross-company=true&$filter=dataAreaId eq 'tank'&$select=ItemNumber,ProductNumber&$top=30`;
      if (inputValue && inputValue.trim().length > 0) {
        url = `/api-data/data/ReleasedProductsV2?cross-company=true&$filter=dataAreaId eq 'tank' and (contains(ItemNumber,'${inputValue.trim()}'))&$select=ItemNumber,ProductNumber&$top=30`;
      }
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.value || []).map((p) => ({
        value: p.ItemNumber,
        label: `${p.ItemNumber}`,
      }));
    } catch (err) {
      console.error("Product search error:", err);
      return [];
    }
  }, []);

  // --- Get product variants ---
  const getProductVariants = useCallback(async (itemNumber) => {
    try {
      const res = await fetch(
        `/api-data/data/ReleasedProductVariantsV2?cross-company=true&$filter=ItemNumber eq '${itemNumber}' and dataAreaId eq 'tank'&$select=ProductColorId,ProductSizeId,ProductStyleId,ProductConfigurationId`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.value || [];
    } catch (err) {
      console.error("Variants error:", err);
      return [];
    }
  }, []);

  // --- Create order line ---
  const createOrderLine = async (orderId, lineData) => {
    const loadingToast = toast.loading("Adding Sales Line...");
    try {
      const payload = {
        dataAreaId: "tank",
        SalesOrderNumber: orderId,
        ItemNumber: lineData.itemNumber,
        OrderedSalesQuantity: parseFloat(lineData.quantity),
        ShippingSiteId: lineData.siteId,
        ShippingWarehouseId: lineData.warehouseId,
      };

      if (lineData.colorId) payload.ProductColorId = lineData.colorId;
      if (lineData.sizeId) payload.ProductSizeId = lineData.sizeId;
      if (lineData.styleId) payload.ProductStyleId = lineData.styleId;
      if (lineData.configId) payload.ProductConfigurationId = lineData.configId;
      if (lineData.price) payload.SalesPrice = parseFloat(lineData.price);

      const res = await fetch("/api-data/data/SalesOrderLinesV3", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchOrderLines(orderId);
        toast.success("Line added successfully!", { id: loadingToast });
        return true;
      } else {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error?.innererror?.message || errorData?.error?.message || "Unknown error";
        toast.error(`D365 Rejection: ${msg}`, { id: loadingToast, duration: 6000 });
        return false;
      }
    } catch (err) {
      toast.error("Network error.", { id: loadingToast });
      return false;
    }
  };

  // --- Create order ---
  const createOrder = async (orderData) => {
    const loadingToast = toast.loading("Creating Sales Order...");
    try {
      const payload = {
        dataAreaId: "tank",
        OrderingCustomerAccountNumber: orderData.customerAccount,
        CurrencyCode: orderData.currencyCode || "EGP",
        LanguageId: "ar",
      };

      const res = await fetch("/api-data/data/SalesOrderHeadersV3", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        const selectedCustomer = customers.find(
          (c) => c.CustomerAccount === orderData.customerAccount
        );
        const customerName = selectedCustomer ? selectedCustomer.NameAlias : "New Order";

        setAllOrders((prev) => [
          {
            SalesOrderNumber: result.SalesOrderNumber,
            SalesOrderName: customerName,
            SalesOrderProcessingStatus: "Active",
            OrderingCustomerAccountNumber: payload.OrderingCustomerAccountNumber,
            InvoiceCustomerAccountNumber: result.InvoiceCustomerAccountNumber || "",
          },
          ...prev,
        ]);
        setCurrentPage(1);
        toast.success(`Order ${result.SalesOrderNumber} created!`, { id: loadingToast });
        return true;
      } else {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error?.innererror?.message || errorData?.error?.message || "Unknown error";
        toast.error(`Failed: ${msg}`, { id: loadingToast, duration: 6000 });
        return false;
      }
    } catch (err) {
      toast.error("Network error.", { id: loadingToast });
      return false;
    }
  };

  // --- Initial data fetch ---
  useEffect(() => {
    const loadInitialData = async () => {
      const headers = { Accept: "application/json" };

      try {
        const oRes = await fetch(
          "/api-data/data/SalesOrderHeadersV3?cross-company=true&$filter=dataAreaId eq 'tank'&$select=SalesOrderNumber,SalesOrderName,SalesOrderProcessingStatus,OrderingCustomerAccountNumber,InvoiceCustomerAccountNumber,OrderCreationDateTime&$orderby=SalesOrderNumber desc&$top=200",
          { headers }
        );
        if (oRes.ok) {
          const oData = await oRes.json();
          setAllOrders(oData.value || []);
          console.log(`✔ Orders loaded: ${(oData.value || []).length}`);
        }
      } catch (err) {
        console.error("Orders error:", err);
      }

      try {
        const cRes = await fetch(
          "/api-data/data/Customers?$select=CustomerAccount,NameAlias&cross-company=true&$filter=dataAreaId eq 'tank'&$top=1000",
          { headers }
        );
        if (cRes.ok) {
          const cData = await cRes.json();
          setCustomers(cData.value || []);
          console.log(`✔ Customers loaded: ${(cData.value || []).length}`);
        }
      } catch (err) {
        console.error("Customers error:", err);
      }

      try {
        const cuRes = await fetch(
          "/api-data/data/Currencies?$select=CurrencyCode,Name&$top=100",
          { headers }
        );
        if (cuRes.ok) {
          const cuData = await cuRes.json();
          setCurrencies(cuData.value || []);
          console.log(`✔ Currencies loaded: ${(cuData.value || []).length}`);
        }
      } catch (err) {
        console.error("Currencies error:", err);
      }

      try {
        const sRes = await fetch(
          "/api-data/data/OperationalSites?cross-company=true&$filter=dataAreaId eq 'tank'&$select=SiteId,SiteName&$top=50",
          { headers }
        );
        if (sRes.ok) {
          const sData = await sRes.json();
          setSites(sData.value || []);
          console.log(`✔ Sites loaded: ${(sData.value || []).length}`);
        }
      } catch (err) {
        console.error("Sites error:", err);
      }

      try {
        const wRes = await fetch(
          "/api-data/data/Warehouses?cross-company=true&$filter=dataAreaId eq 'tank'&$select=WarehouseId,WarehouseName&$top=50",
          { headers }
        );
        if (wRes.ok) {
          const wData = await wRes.json();
          setWarehouses(wData.value || []);
          console.log(`✔ Warehouses loaded: ${(wData.value || []).length}`);
        }
      } catch (err) {
        console.error("Warehouses error:", err);
      }

      setLoading(false);
    };
    loadInitialData();
  }, []);

  // --- Client-side search & pagination ---
  const filteredOrders = allOrders
    .map((item) => ({
      id: item.SalesOrderNumber,
      customerAccount: item.OrderingCustomerAccountNumber || "",
      invoiceAccount: item.InvoiceCustomerAccountNumber || "",
      customerName: item.SalesOrderName || "",
      status: item.SalesOrderProcessingStatus || "Active",
    }))
    .filter(
      (o) =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerAccount.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return {
    orders: paginatedOrders,
    totalItems: filteredOrders.length,
    customers,
    currencies,
    sites,
    warehouses,
    lines,
    loading,
    linesLoading,
    fetchOrderLines,
    createOrderLine,
    createOrder,
    searchProducts,
    getProductVariants,
    searchTerm,
    setSearchTerm: (t) => { setSearchTerm(t); setCurrentPage(1); },
    currentPage,
    setCurrentPage,
    itemsPerPage,
  };
};