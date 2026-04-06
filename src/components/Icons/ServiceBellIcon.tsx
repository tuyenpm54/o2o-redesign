import React from 'react';
import { ConciergeBell } from 'lucide-react';

/**
 * Service Bell (Concierge Bell)
 * Returns the perfectly refined ConciergeBell from Lucide to ensure 
 * 100% aesthetic harmony and sharpness with the rest of the application.
 */
export const ServiceBellIcon = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor', 
  strokeWidth = 2, 
  ...props 
}: { 
  size?: number | string; 
  className?: string; 
  color?: string; 
  strokeWidth?: number; 
  [key: string]: any;
}) => (
  <ConciergeBell 
    size={size} 
    className={className} 
    color={color} 
    strokeWidth={strokeWidth} 
    {...props} 
  />
);
