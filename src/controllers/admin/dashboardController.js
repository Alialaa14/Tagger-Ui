import { fetchAdminOrders } from "./ordersController";
import { normalizeNumber } from "./shared";

function readAmount(order) {
  return (
    normalizeNumber(order?.finalTotal) ||
    normalizeNumber(order?.total) ||
    normalizeNumber(order?.totalPrice) ||
    normalizeNumber(order?.amount)
  );
}

export async function fetchAdminDashboardStats() {
  const orders = await fetchAdminOrders();
  const totalOrders = orders.length;

  const byStatus = orders.reduce((acc, order) => {
    const status = String(order?.status || "unknown");
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const revenueTotal = orders.reduce((sum, order) => sum + readAmount(order), 0);
  const revenueAvg = totalOrders ? revenueTotal / totalOrders : 0;

  return {
    totalOrders,
    pendingOrders: byStatus.pending || 0,
    acceptedOrders: byStatus.accepted || 0,
    rejectedOrders: byStatus.rejected || 0,
    forwardedOrders: byStatus.forwarded || 0,
    revenueTotal,
    revenueAvg,
  };
}
