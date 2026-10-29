import { TFunction } from 'i18next';

const bookingStatusKeys: Record<string, string> = {
  booked: 'stepBooked',
  confirmed: 'statusConfirmed',
  verified: 'stepVerified',
  'in procurement': 'stepInProcurement',
  completed: 'stepCompleted',
  cancelled: 'statusCancelled',
};

export function translateBookingStatus(status: string, t: TFunction): string {
  const key = bookingStatusKeys[status.trim().toLowerCase()];
  return key ? t(key) : status;
}

export function translatePaymentStatus(status: string, t: TFunction): string {
  const key = status === 'Completed' ? 'paymentCompleted' : status === 'Processing' ? 'paymentProcessing' : status === 'Pending' ? 'paymentPending' : '';
  return key ? t(key) : status;
}
