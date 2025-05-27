import React from 'react';
import { Badge } from 'react-bootstrap';

interface ExpiryStatusBadgeProps {
  status: string;
}

export const ExpiryStatusBadge: React.FC<ExpiryStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case "Còn hạn": return "success";
      case "Sắp hết hạn": return "warning";
      case "Hết hạn hôm nay":
      case "Đã hết hạn": return "danger";
      default: return "secondary";
    }
  };

  return <Badge bg={getVariant()}>{status}</Badge>;
};