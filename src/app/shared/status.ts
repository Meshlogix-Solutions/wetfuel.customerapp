/**
 * Derives customer-facing presentation fields from live API status codes and entity data.
 * Prefer values already returned by the API when present; otherwise enrich from `status`
 * (and related fields) so the UI never invents marketing copy.
 */

import type { CustomerEquipment, CustomerInvoice, CustomerJob, CustomerOrder, CustomerProfile } from '../services/customer-api.service';

type Tone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

interface StatusMeta {
  label: string;
  tone: Tone;
  group: string;
}

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

const ORDER_META: Record<string, StatusMeta & { canCancel: boolean }> = {
  submitted: { label: 'Submitted', tone: 'info', group: 'active', canCancel: true },
  approved: { label: 'Approved', tone: 'info', group: 'active', canCancel: true },
  scheduled: { label: 'Scheduled', tone: 'warning', group: 'active', canCancel: false },
  in_progress: { label: 'In Progress', tone: 'warning', group: 'in_transit', canCancel: false },
  completed: { label: 'Completed', tone: 'success', group: 'delivered', canCancel: false },
  cancelled: { label: 'Cancelled', tone: 'danger', group: 'cancelled', canCancel: false },
};

const JOB_META: Record<string, StatusMeta> = {
  pending: { label: 'Pending', tone: 'info', group: 'active' },
  assigned: { label: 'Assigned', tone: 'info', group: 'active' },
  started: { label: 'En Route', tone: 'warning', group: 'active' },
  arrived: { label: 'On Site', tone: 'warning', group: 'active' },
  equipment_verified: { label: 'Equipment Verified', tone: 'warning', group: 'active' },
  fueled: { label: 'Fueled', tone: 'warning', group: 'active' },
  proof_submitted: { label: 'Proof Submitted', tone: 'info', group: 'active' },
  completed: { label: 'Completed', tone: 'success', group: 'delivered' },
  cancelled: { label: 'Cancelled', tone: 'danger', group: 'cancelled' },
};

const INVOICE_META: Record<string, StatusMeta & { canPay: boolean; isOpen: boolean }> = {
  draft: { label: 'Draft', tone: 'neutral', group: 'open', canPay: false, isOpen: true },
  sent: { label: 'Sent', tone: 'warning', group: 'open', canPay: true, isOpen: true },
  paid: { label: 'Paid', tone: 'success', group: 'paid', canPay: false, isOpen: false },
  void: { label: 'Void', tone: 'danger', group: 'closed', canPay: false, isOpen: false },
  overdue: { label: 'Overdue', tone: 'danger', group: 'open', canPay: true, isOpen: true },
};

const EQUIPMENT_META: Record<string, { label: string; tone: Tone }> = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  maintenance: { label: 'Maintenance', tone: 'warning' },
  retired: { label: 'Retired', tone: 'danger' },
};

function humanize(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function code(status?: string): string {
  return (status || '').toLowerCase().trim();
}

/** The dashboard's "next delivery" hero can be backed by either a job or an order status string. */
export function deliveryStatusIcon(status: string): string {
  const key = code(status);
  return JOB_STATUS_ICONS[key] ?? ORDER_STATUS_ICONS[key] ?? 'ellipse-outline';
}

export function enrichOrder(order: CustomerOrder): CustomerOrder {
  const status = code(order.status);
  const meta = ORDER_META[status] ?? { label: humanize(status || 'unknown'), tone: 'neutral' as Tone, group: 'active', canCancel: false };
  return {
    ...order,
    statusLabel: order.statusLabel || meta.label,
    statusTone: order.statusTone || meta.tone,
    statusGroup: order.statusGroup || meta.group,
    canCancel: order.canCancel ?? meta.canCancel,
  };
}

export function enrichJob(job: CustomerJob): CustomerJob {
  const status = code(job.status);
  const meta = JOB_META[status] ?? { label: humanize(status || 'unknown'), tone: 'neutral' as Tone, group: 'active' };
  return {
    ...job,
    statusLabel: job.statusLabel || meta.label,
    statusTone: job.statusTone || meta.tone,
    statusGroup: job.statusGroup || meta.group,
    statusMessage: job.statusMessage || composeJobMessage(job, meta.label),
  };
}

export function enrichInvoice(invoice: CustomerInvoice): CustomerInvoice {
  const status = code(invoice.status);
  const overdue = invoice.isOverdue === true || (status === 'sent' && invoice.isOverdue);
  const key = overdue && status === 'sent' ? 'overdue' : status;
  const meta = INVOICE_META[key] ?? { label: humanize(status || 'unknown'), tone: 'neutral' as Tone, group: 'open', canPay: false, isOpen: status !== 'paid' && status !== 'void' };
  return {
    ...invoice,
    statusLabel: invoice.statusLabel || meta.label,
    statusTone: invoice.statusTone || meta.tone,
    statusGroup: invoice.statusGroup || meta.group,
    canPay: invoice.canPay ?? meta.canPay,
    isOpen: invoice.isOpen ?? meta.isOpen,
  };
}

export function enrichEquipment(item: CustomerEquipment): CustomerEquipment {
  const status = code(item.status);
  const meta = EQUIPMENT_META[status] ?? { label: humanize(status || 'unknown'), tone: 'neutral' as Tone };
  return {
    ...item,
    statusLabel: item.statusLabel || meta.label,
    statusTone: item.statusTone || meta.tone,
  };
}

export function enrichProfile(profile: CustomerProfile): CustomerProfile {
  const status = code(profile.status);
  const active = profile.isActive ?? status === 'active';
  return {
    ...profile,
    isActive: active,
    statusLabel: profile.statusLabel || (active ? 'Active' : humanize(status || 'inactive')),
  };
}

/** Order detail banner copy built only from live order/job fields. */
export function orderStatusMessage(order: CustomerOrder, job?: CustomerJob | null): string {
  if (job?.statusMessage) return job.statusMessage;
  const parts: string[] = [];
  if (order.siteName) parts.push(order.siteName);
  if (order.scheduledAt) {
    parts.push(new Date(order.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }));
  } else if (order.deliveryWindow) {
    parts.push(order.deliveryWindow);
  }
  if (order.driverName) parts.push(order.driverName);
  if (order.instructions?.trim()) parts.push(order.instructions.trim());
  return parts.join(' · ') || order.statusLabel || humanize(code(order.status));
}

function composeJobMessage(job: CustomerJob, fallbackLabel: string): string {
  const status = code(job.status);
  switch (status) {
    case 'pending':
      return job.siteName ? `Awaiting dispatch to ${job.siteName}` : 'Awaiting dispatch';
    case 'assigned':
      return job.driverName ? `Assigned to ${job.driverName}` : job.siteName ? `Assigned for ${job.siteName}` : 'Driver assigned';
    case 'started':
      return job.driverName ? `${job.driverName} is en route` : 'Delivery en route';
    case 'arrived':
    case 'equipment_verified':
    case 'fueled':
    case 'proof_submitted':
      return job.driverName ? `${job.driverName} is on site` : 'Driver on site';
    case 'completed':
      return job.deliveredGallons != null ? `Delivered ${job.deliveredGallons} gal` : 'Delivery completed';
    case 'cancelled':
      return 'This delivery was cancelled';
    default:
      return fallbackLabel;
  }
}
