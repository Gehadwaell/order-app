import api from "./api";

/**
 * Fetch sales order headers.
 * D365 entity: SalesOrderHeadersV3 (cross-company)
 */
export async function getSalesOrders({ page = 1, pageSize = 3, search = "" } = {}) {
  const params = new URLSearchParams({
    "cross-company": "true",
    $top: String(pageSize),
    $skip: String((page - 1) * pageSize),
    $orderby: "SalesOrderNumber desc",
    $count: "true",
  });

  if (search) {
    params.set(
      "$filter",
      `contains(SalesOrderNumber,'${search}') or contains(OrderingCustomerAccountNumber,'${search}')`
    );
  }

  const { data } = await api.get(`/SalesOrderHeadersV3?${params}`);
  return {
    items: data.value || [],
    total: data["@odata.count"] ?? 0,
  };
}

/**
 * Fetch a single sales order by number.
 */
export async function getSalesOrderById(orderNumber, dataAreaId = "tank") {
  const { data } = await api.get(
    `/SalesOrderHeadersV3(dataAreaId='${dataAreaId}',SalesOrderNumber='${orderNumber}')?cross-company=true`
  );
  return data;
}

/**
 * Create a new sales order header.
 */
export async function createSalesOrder(payload) {
  // payload example: { dataAreaId: "tank", CurrencyCode: "EGP", OrderingCustomerAccountNumber: "TANK-000001" }
  const { data } = await api.post("/SalesOrderHeadersV3", payload);
  return data;
}
