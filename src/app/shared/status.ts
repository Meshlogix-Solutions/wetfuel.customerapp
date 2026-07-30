/**
 * Status labels, colors, groupings, and permission flags (canCancel, canPay, isActive, ...) all
 * come from the API now - see statusLabel/statusTone/statusGroup on CustomerOrder, CustomerJob,
 * CustomerInvoice, CustomerEquipment and CustomerProfile. The backend owns what a status means;
 * this file only maps a status to an ionicons name, which is a client-side/UI-library concern
 * (a different frontend could reasonably pick different icons for the same status).
 */

const JOB_STATUS_ICONS: Record<string, string> = {
  pending: 'time-outline',
  assigned: 'checkmark-circle-outline',
  started: 'navigate-outline',
  arrived: 'location-outline',
  equipment_verified: 'water-outline',
  fueled: 'water-outline',
  proof_submitted: 'checkmark-circle-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
};

const ORDER_STATUS_ICONS: Record<string, string> = {
  submitted: 'time-outline',
  approved: 'checkmark-circle-outline',
  scheduled: 'calendar-outline',
  in_progress: 'car-sport-outline',
  completed: 'checkmark-circle-outline',
  cancelled: 'close-circle-outline',
};

/** The dashboard's "next delivery" hero can be backed by either a job or an order status string. */
export function deliveryStatusIcon(status: string): string {
  return JOB_STATUS_ICONS[status] ?? ORDER_STATUS_ICONS[status] ?? 'ellipse-outline';
}
