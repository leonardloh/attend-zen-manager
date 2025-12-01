export interface WeeklyAttendancePoint {
  weekKey: string;
  weekLabel: string;
  attendanceCount: number;
  isMissing: boolean;
  isHoliday?: boolean;
  holidayCount?: number;
  targetDate?: string;
}
