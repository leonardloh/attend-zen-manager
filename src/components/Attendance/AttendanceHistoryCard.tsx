import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { WeeklyAttendancePoint } from './types';

interface AttendanceHistoryCardProps {
  data: WeeklyAttendancePoint[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const AttendanceHistoryCard: React.FC<AttendanceHistoryCardProps> = ({
  data,
  loading = false,
  error = null,
  onRetry,
}) => {
  const hasData = data.length > 0;
  const missingWeeks = data.filter((item) => item.isMissing);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span>历史考勤记录概览</span>
            {loading && <span className="text-xs text-muted-foreground">加载中...</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-56">
              <Skeleton className="h-full w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-sm text-red-600">
              <span>无法获取该班级的历史考勤记录：{error}</span>
              {onRetry && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  重试
                </Button>
              )}
            </div>
          ) : hasData ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} label={{ value: '出席人数', angle: -90, position: 'insideLeft', offset: 10 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value} 人`, '出席人数']}
                    labelFormatter={(label: string) => `周次：${label}`}
                  />
                  <Bar dataKey="attendanceCount" radius={[6, 6, 0, 0]}>
                    {data.map((entry) => (
                      <Cell
                        key={entry.weekKey}
                        fill={entry.isMissing ? '#ef4444' : '#22c55e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无历史考勤记录
            </div>
          )}
        </CardContent>
      </Card>

      {missingWeeks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="space-y-3 py-4 text-sm text-red-700">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              提醒：以下周次尚未填写考勤
            </div>
            <ul className="list-disc space-y-1 pl-5">
              {missingWeeks.map((week) => (
                <li key={week.weekKey}>{week.weekLabel}</li>
              ))}
            </ul>
            <p className="text-xs text-red-600">
              请尽快补充该班级以上周次的考勤数据，以保持记录完整。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceHistoryCard;
