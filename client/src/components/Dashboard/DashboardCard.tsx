
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  value,
  description,
  icon: Icon,
  trend,
  onClick
}) => {
  return (
    <Card 
      className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {description && (
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
