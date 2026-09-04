import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';

export function PaymentStatusBadge({ status }) {
  return <StatusBadge status={status} />;
}
