import { IconType } from 'react-icons';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconType;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'bg-rosa-tulip text-rosa-petalo',
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${color} bg-opacity-20`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.isPositive ? '↑' : '↓'}
                    <span className="sr-only"> {trend.isPositive ? 'Increased' : 'Decreased'} by </span>
                    {trend.value}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {subtitle && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm text-gray-500">
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
}
