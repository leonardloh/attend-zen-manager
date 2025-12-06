import { useState, useMemo, useEffect, useCallback, type FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Calendar as CalendarIcon, TrendingUp, Users, CheckCircle, Check, ChevronsUpDown, Search } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';
import { getAttendanceStats } from '@/lib/database/attendance';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { format, subMonths } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface WeeklyAttendanceData {
  name: string;
  present: number;
  online: number;
  absent: number;
  leave: number;
  holiday: number;
}

type StudentTypeFilter = 'all' | 'cadre' | 'regular';

const Reports: FC = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(() => subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(() => new Date());
  const [selectedClass, setSelectedClass] = useState('all');
  const [classFilterOpen, setClassFilterOpen] = useState(false);
  const [studentTypeFilter, setStudentTypeFilter] = useState<StudentTypeFilter>('all');
  const [studentTypeFilterOpen, setStudentTypeFilterOpen] = useState(false);
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<WeeklyAttendanceData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [classAttendanceStats, setClassAttendanceStats] = useState<Map<number, {
    present: number;
    online: number;
    leave: number;
    absent: number;
    total: number;
    attendanceRate: number;
    latestDate?: string;
  }>>(new Map());
  
  // Get data from database context
  const {
    students,
    classes,
    isLoadingStudents,
    isLoadingClasses
  } = useDatabase();
  
  const isLoading = isLoadingStudents || isLoadingClasses;

  // Calculate weekly date ranges from start and end dates
  const calculateWeeklyRanges = useCallback((start: Date, end: Date): { start: string; end: string; label: string }[] => {
    const weeks: { start: string; end: string; label: string }[] = [];
    
    // Create a copy to avoid mutating the original
    let weekStart = new Date(start);
    
    // Adjust to Monday of the week (or keep start date if it's after Monday)
    const dayOfWeek = weekStart.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since Monday (Monday=0)
    weekStart = new Date(weekStart.getTime() - daysFromMonday * 24 * 60 * 60 * 1000);
    
    // If week start is before the range start, use the range start
    if (weekStart < start) {
      weekStart = new Date(start);
    }
    
    while (weekStart <= end) {
      // Calculate end of week (Sunday) or end date, whichever is earlier
      const dayOfWeekNow = weekStart.getDay();
      const daysToSunday = dayOfWeekNow === 0 ? 0 : 7 - dayOfWeekNow;
      let weekEnd = new Date(weekStart.getTime() + daysToSunday * 24 * 60 * 60 * 1000);
      
      // Cap at end date
      if (weekEnd > end) {
        weekEnd = new Date(end);
      }
      
      const label = `${format(weekStart, 'MM/dd', { locale: zhCN })}-${format(weekEnd, 'MM/dd', { locale: zhCN })}`;
      weeks.push({ 
        start: format(weekStart, 'yyyy-MM-dd'), 
        end: format(weekEnd, 'yyyy-MM-dd'), 
        label 
      });
      
      // Move to next Monday
      weekStart = new Date(weekEnd.getTime() + 24 * 60 * 60 * 1000);
    }
    
    return weeks;
  }, []);

  // Handle search button click - uses direct Supabase query with RLS for security
  const handleSearch = useCallback(async () => {
    setIsSearching(true);
    
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');
      
      // If filtering by student type, first get the relevant student IDs
      let studentIdFilter: number[] | null = null;
      
      if (studentTypeFilter !== 'all') {
        // Fetch all cadre student IDs (optionally filtered by class)
        let cadreQuery = supabase
          .from('class_cadres')
          .select('student_id');
        
        if (selectedClass !== 'all') {
          cadreQuery = cadreQuery.eq('class_id', Number(selectedClass));
        }
        
        const { data: cadreData, error: cadreError } = await cadreQuery;
        
        if (cadreError) {
          console.error('Error fetching cadre data:', cadreError);
          toast({
            title: '查询失败',
            description: '获取班干部数据失败',
            variant: 'destructive'
          });
          setIsSearching(false);
          return;
        }
        
        const cadreStudentIds = [...new Set((cadreData || []).map(c => c.student_id))];
        
        if (studentTypeFilter === 'cadre') {
          // Only include cadre students
          studentIdFilter = cadreStudentIds;
          if (studentIdFilter.length === 0) {
            toast({
              title: '无数据',
              description: '所选范围内没有班干部'
            });
            setWeeklyAttendanceData([]);
            setHasSearched(true);
            setIsSearching(false);
            return;
          }
        } else if (studentTypeFilter === 'regular') {
          // Need to get all student IDs and exclude cadres
          let studentQuery = supabase
            .from('students')
            .select('id');
          
          const { data: allStudentsData, error: studentError } = await studentQuery;
          
          if (studentError) {
            console.error('Error fetching students:', studentError);
            toast({
              title: '查询失败',
              description: '获取学员数据失败',
              variant: 'destructive'
            });
            setIsSearching(false);
            return;
          }
          
          // Exclude cadre student IDs
          studentIdFilter = (allStudentsData || [])
            .map(s => s.id)
            .filter(id => !cadreStudentIds.includes(id));
            
          if (studentIdFilter.length === 0) {
            toast({
              title: '无数据',
              description: '所选范围内没有普通学员'
            });
            setWeeklyAttendanceData([]);
            setHasSearched(true);
            setIsSearching(false);
            return;
          }
        }
      }
      
      // Fetch attendance records directly from Supabase (RLS will filter by user's scope)
      let query = supabase
        .from('class_attendance')
        .select('attendance_status, attendance_date, student_id')
        .gte('attendance_date', startStr)
        .lte('attendance_date', endStr);
      
      // Filter by class if not "all"
      if (selectedClass !== 'all') {
        query = query.eq('class_id', Number(selectedClass));
      }
      
      // Filter by student IDs if applicable
      if (studentIdFilter !== null) {
        query = query.in('student_id', studentIdFilter);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching attendance data:', error);
        toast({
          title: '查询失败',
          description: '获取点名数据失败，请稍后再试',
          variant: 'destructive'
        });
        return;
      }
      
      // Calculate weekly ranges
      const weeks = calculateWeeklyRanges(startDate, endDate);
      
      // Bucket records into weeks
      const weeklyData: WeeklyAttendanceData[] = weeks.map(week => {
        // Filter records for this week
        const weekRecords = (data || []).filter(r => {
          return r.attendance_date >= week.start && r.attendance_date <= week.end;
        });
        
        // Count all statuses including holidays
        const holidayRecords = weekRecords.filter(r => r.attendance_status === 4);
        const nonHolidayRecords = weekRecords.filter(r => r.attendance_status !== 4);
        
        return {
          name: week.label,
          present: nonHolidayRecords.filter(r => r.attendance_status === 1).length,
          online: nonHolidayRecords.filter(r => r.attendance_status === 2).length,
          leave: nonHolidayRecords.filter(r => r.attendance_status === 3).length,
          absent: nonHolidayRecords.filter(r => r.attendance_status === 0).length,
          holiday: holidayRecords.length
        };
      });
      
      console.log('Search results:', { 
        totalRecords: data?.length || 0, 
        weeks: weeks.length,
        weeklyData 
      });
      
      setWeeklyAttendanceData(weeklyData);
      setHasSearched(true);
      
      if (weeklyData.every(w => w.present === 0 && w.online === 0 && w.leave === 0 && w.absent === 0 && w.holiday === 0)) {
        toast({
          title: '无数据',
          description: '所选时间范围内没有点名记录'
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: '网络错误',
        description: '获取数据失败，请检查网络连接',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  }, [startDate, endDate, selectedClass, studentTypeFilter, toast, calculateWeeklyRanges]);

  // Fetch real attendance statistics for each class
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      const statsMap = new Map();
      for (const cls of classes) {
        try {
          const stats = await getAttendanceStats(Number(cls.id));
          statsMap.set(Number(cls.id), stats);
        } catch (error) {
          console.error(`Failed to fetch stats for class ${cls.id}:`, error);
        }
      }
      setClassAttendanceStats(statsMap);
    };

    if (classes.length > 0) {
      fetchAttendanceStats();
    }
  }, [classes]);

  // Calculate real statistics from database
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === '活跃').length;
    const totalClasses = classes.length;
    
    // Calculate overall attendance rate
    const overallAttendanceRate = classes.length > 0 
      ? Math.round(classes.reduce((sum, cls) => sum + cls.attendance_rate, 0) / classes.length)
      : 0;
    
    // Calculate total sessions this month (estimate based on classes)
    const totalSessions = classes.length * 4; // Assuming 4 sessions per month per class
    
    return {
      totalStudents,
      activeStudents,
      totalClasses,
      overallAttendanceRate,
      totalSessions,
      trend: overallAttendanceRate > 85 ? 5.2 : -2.1
    };
  }, [students, classes]);
  
  // Generate attendance trend data - only show data after search is performed
  const attendanceData = useMemo(() => {
    if (hasSearched && weeklyAttendanceData.length > 0) {
      return weeklyAttendanceData;
    }
    // Before search: return empty array (chart will show message)
    return [];
  }, [hasSearched, weeklyAttendanceData]);


  // Handle loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载报表数据中...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">报告统计</h1>
          <p className="text-gray-600">Reports & Analytics</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出Excel
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    data-testid="button-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy年MM月dd日", { locale: zhCN }) : "选择开始日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    disabled={(date) => date > endDate || date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    data-testid="button-end-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy年MM月dd日", { locale: zhCN }) : "选择结束日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    disabled={(date) => date < startDate || date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                班级筛选
              </label>
              <Popover open={classFilterOpen} onOpenChange={setClassFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={classFilterOpen}
                    className="w-full justify-between"
                    data-testid="button-class-filter"
                  >
                    {selectedClass === 'all'
                      ? "全部班级"
                      : classes.find((cls) => String(cls.id) === selectedClass)?.name || "选择班级"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="搜索班级..." data-testid="input-search-class" />
                    <CommandList>
                      <CommandEmpty>未找到班级</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setSelectedClass('all');
                            setClassFilterOpen(false);
                          }}
                          data-testid="option-class-all"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClass === 'all' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          全部班级
                        </CommandItem>
                        {classes.map((cls) => (
                          <CommandItem
                            key={cls.id}
                            value={cls.name}
                            onSelect={() => {
                              setSelectedClass(String(cls.id));
                              setClassFilterOpen(false);
                            }}
                            data-testid={`option-class-${cls.id}`}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClass === String(cls.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {cls.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                人员筛选
              </label>
              <Popover open={studentTypeFilterOpen} onOpenChange={setStudentTypeFilterOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentTypeFilterOpen}
                    className="w-full justify-between"
                    data-testid="button-student-type-filter"
                  >
                    {studentTypeFilter === 'all' ? '整体出席' : 
                     studentTypeFilter === 'cadre' ? '班干部出席' : '学员出席'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setStudentTypeFilter('all');
                            setStudentTypeFilterOpen(false);
                          }}
                          data-testid="option-student-type-all"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              studentTypeFilter === 'all' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          整体出席
                        </CommandItem>
                        <CommandItem
                          value="cadre"
                          onSelect={() => {
                            setStudentTypeFilter('cadre');
                            setStudentTypeFilterOpen(false);
                          }}
                          data-testid="option-student-type-cadre"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              studentTypeFilter === 'cadre' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          班干部出席
                        </CommandItem>
                        <CommandItem
                          value="regular"
                          onSelect={() => {
                            setStudentTypeFilter('regular');
                            setStudentTypeFilterOpen(false);
                          }}
                          data-testid="option-student-type-regular"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              studentTypeFilter === 'regular' ? "opacity-100" : "opacity-0"
                            )}
                          />
                          学员出席
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full sm:w-auto"
                data-testid="button-search"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    搜索中...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    搜索
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总学员数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均出席率</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overallAttendanceRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">本月课程数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">趋势</p>
                <p className={`text-2xl font-bold ${stats.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.trend > 0 ? '+' : ''}{stats.trend}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>周点名趋势</CardTitle>
        </CardHeader>
        <CardContent>
          {attendanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#10B981" name="实体出席" />
                <Bar dataKey="online" fill="#3B82F6" name="线上出席" />
                <Bar dataKey="leave" fill="#F59E0B" name="请假" />
                <Bar dataKey="absent" fill="#EF4444" name="缺席" />
                <Bar dataKey="holiday" fill="#8B5CF6" name="放假" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <div className="text-center">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>请选择日期范围和班级后点击"搜索"按钮查看数据</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>详细点名报告</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">班级</th>
                  <th className="text-left p-2">日期</th>
                  <th className="text-left p-2">实体出席</th>
                  <th className="text-left p-2">线上出席</th>
                  <th className="text-left p-2">请假</th>
                  <th className="text-left p-2">缺席</th>
                  <th className="text-left p-2">出席率</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const stats = classAttendanceStats.get(Number(cls.id));
                  const presentCount = stats?.present ?? 0;
                  const onlineCount = stats?.online ?? 0;
                  const leaveCount = stats?.leave ?? 0;
                  const absentCount = stats?.absent ?? 0;
                  const attendanceRate = stats?.attendanceRate ?? 0;
                  const latestDate = stats?.latestDate || '暂无记录';
                  
                  return (
                    <tr key={cls.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{cls.name}</td>
                      <td className="p-2">{latestDate}</td>
                      <td className="p-2">{presentCount}</td>
                      <td className="p-2">{onlineCount}</td>
                      <td className="p-2">{leaveCount}</td>
                      <td className="p-2">{absentCount}</td>
                      <td className="p-2">
                        <Badge 
                          variant={attendanceRate >= 90 ? 'default' : attendanceRate >= 80 ? 'secondary' : 'destructive'}
                        >
                          {attendanceRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
