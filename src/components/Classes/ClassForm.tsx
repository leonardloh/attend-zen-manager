
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import StudentMultiSelect from '@/components/Students/StudentMultiSelect';
import SubBranchSearchInput from '@/components/Classes/SubBranchSearchInput';
import { ClassInfo } from '@/data/types';
import { useDatabase } from '@/contexts/DatabaseContext';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const classFormSchema = z.object({
  name: z.string().min(1, '班级名称不能为空'),
  sub_branch_id: z.string().min(1, '请选择所属分院'),
  sub_branch_name: z.string().optional(),
  weekday: z.enum(['周一', '周二', '周三', '周四', '周五', '周六', '周日'], {
    required_error: '请选择星期',
  }),
  start_time: z.string().min(1, '开始时间不能为空'),
  end_time: z.string().min(1, '结束时间不能为空'),
  class_monitor_id: z.string().min(1, '班长学号不能为空'),
  deputy_monitors: z.array(z.string()).optional(),
  care_officers: z.array(z.string()).optional(),
  student_ids: z.array(z.string()).optional(),
}).refine((data) => {
  const startTime = parseInt(data.start_time.replace(':', ''));
  const endTime = parseInt(data.end_time.replace(':', ''));
  return endTime > startTime;
}, {
  message: '结束时间必须晚于开始时间',
  path: ['end_time'],
});

type ClassFormData = z.infer<typeof classFormSchema>;

// ClassInfo interface is now imported from @/data/types


// Time options for dropdowns
const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

// Helper functions to convert between database IDs and student IDs
const convertDatabaseIdsToStudentIds = (databaseIds: number[], students: any[]): string[] => {
  return databaseIds.map(dbId => {
    const student = students.find(s => s.id === dbId.toString());
    return student ? student.student_id : '';
  }).filter(id => id !== '');
};

const getStudentIdFromDatabaseId = (databaseId: number | undefined, students: any[]): string => {
  if (!databaseId) return '';
  const student = students.find(s => s.id === databaseId.toString());
  return student ? student.student_id : '';
};

// Helper functions to convert student IDs to database IDs (for form submission)
const convertStudentIdsToDatabaseIds = (studentIds: string[], students: any[]): number[] => {
  return studentIds.map(studentId => {
    const student = students.find(s => s.student_id === studentId);
    return student ? parseInt(student.id) : null;
  }).filter((id): id is number => id !== null);
};

const getStudentDatabaseIdFromStudentId = (studentId: string, students: any[]): number | undefined => {
  if (!studentId) return undefined;
  const student = students.find(s => s.student_id === studentId);
  return student ? parseInt(student.id) : undefined;
};

interface ClassFormProps {
  initialData?: ClassInfo;
  onSubmit: (data: ClassFormData & { student_count: number; attendance_rate: number }) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Get students data from context for ID conversion
  const { students } = useDatabase();
  
  // Parse existing time if editing (handles both HH:MM and HH:MM:SS formats)
  const parseTime = (timeString: string) => {
    console.log('🔧 parseTime - Input:', timeString);
    
    if (!timeString) return { weekday: undefined, start_time: '', end_time: '' };
    
    const parts = timeString.split(' ');
    if (parts.length >= 2) {
      const timeRange = parts.slice(1).join(' ');
      const [start, end] = timeRange.split('-');
      
      // Strip seconds if present (08:00:00 -> 08:00)
      const formatTime = (time: string) => {
        if (!time) return '';
        return time.substring(0, 5); // Get only HH:MM part
      };
      
      const result = {
        weekday: parts[0] as ClassFormData['weekday'],
        start_time: formatTime(start || ''),
        end_time: formatTime(end || '')
      };
      
      console.log('🔧 parseTime - Output:', result);
      return result;
    }
    
    console.log('🔧 parseTime - Failed to parse, returning defaults');
    return { weekday: undefined, start_time: '', end_time: '' };
  };
  
  // Convert database data to form format for editing
  const getInitialFormData = () => {
    if (!initialData) {
      // Default values for new class creation
      return {
        name: '',
        sub_branch_id: '',
        sub_branch_name: '',
        weekday: undefined,
        start_time: '',
        end_time: '',
        class_monitor_id: '',
        deputy_monitors: [],
        care_officers: [],
        student_ids: [],
      };
    }
    
    // Parse time data fresh every time this function is called
    const { weekday, start_time, end_time } = parseTime(initialData.time || '');
    
    console.log('🔧 getInitialFormData - Time parsing:', {
      originalTime: initialData.time,
      parsedWeekday: weekday,
      parsedStartTime: start_time,
      parsedEndTime: end_time
    });
    
    // Values for editing existing class
    return {
      name: initialData.name || '',
      sub_branch_id: initialData.sub_branch_id || '',
      sub_branch_name: initialData.sub_branch_name || '',
      weekday: weekday || undefined,
      start_time: start_time || '',
      end_time: end_time || '',
      class_monitor_id: getStudentIdFromDatabaseId(initialData.monitor_id, students),
      deputy_monitors: convertDatabaseIdsToStudentIds(initialData.deputy_monitors || [], students),
      care_officers: convertDatabaseIdsToStudentIds(initialData.care_officers || [], students),
      student_ids: initialData.mother_class_students || initialData.regular_students || [],
    };
  };

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: getInitialFormData(),
  });

  // Reset form when students data changes (important for edit mode)
  useEffect(() => {
    if (initialData && students && students.length > 0) {
      const formData = getInitialFormData();
      console.log('🔧 useEffect - Resetting form with data:', {
        hasInitialData: !!initialData,
        studentsCount: students.length,
        formData: formData
      });
      form.reset(formData);
    }
  }, [initialData, students]);

  const handleSubmit = (data: ClassFormData) => {
    // Calculate student count from selected students
    const student_count = data.student_ids?.length || 0;
    const attendance_rate = initialData?.attendance_rate || Math.floor(Math.random() * 25) + 75;
    
    // Convert student IDs to database IDs for submission
    const monitorDatabaseId = getStudentDatabaseIdFromStudentId(data.class_monitor_id, students);
    const deputyMonitorDatabaseIds = convertStudentIdsToDatabaseIds(data.deputy_monitors || [], students);
    const careOfficerDatabaseIds = convertStudentIdsToDatabaseIds(data.care_officers || [], students);
    
    console.log('🔧 ClassForm conversion - Student IDs to Database IDs:', {
      form_monitor_id: data.class_monitor_id,
      converted_monitor_id: monitorDatabaseId,
      form_deputy_monitors: data.deputy_monitors,
      converted_deputy_monitors: deputyMonitorDatabaseIds,
      form_care_officers: data.care_officers,
      converted_care_officers: careOfficerDatabaseIds
    });
    
    // Combine data with proper field names and converted IDs
    const combinedTimeData = {
      ...data,
      time: `${data.weekday} ${data.start_time}-${data.end_time}`,
      student_count,
      attendance_rate,
      // Use new field names with converted database IDs
      monitor_id: monitorDatabaseId,
      deputy_monitors: deputyMonitorDatabaseIds,
      care_officers: careOfficerDatabaseIds,
      // Keep student management fields as is
      mother_class_students: data.student_ids || [],
      regular_students: [], // Default empty for now
    };
    
    onSubmit(combinedTimeData);
    form.reset();
  };

  // Helper function to add/remove cadre roles
  const addCadreRole = (roleType: 'deputy_monitors' | 'care_officers') => {
    const currentValues = form.getValues(roleType) || [];
    form.setValue(roleType, [...currentValues, '']);
  };

  const removeCadreRole = (roleType: 'deputy_monitors' | 'care_officers', index: number) => {
    const currentValues = form.getValues(roleType) || [];
    const newValues = currentValues.filter((_, i) => i !== index);
    form.setValue(roleType, newValues);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>班级名称</FormLabel>
              <FormControl>
                <Input placeholder="请输入班级名称" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_branch_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>所属分院</FormLabel>
              <FormControl>
                <SubBranchSearchInput
                  value={field.value}
                  onChange={(subBranchId, subBranchName) => {
                    field.onChange(subBranchId);
                    form.setValue('sub_branch_name', subBranchName);
                  }}
                  placeholder="搜索并选择所属分院..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weekday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>星期</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择星期" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="周一">周一</SelectItem>
                  <SelectItem value="周二">周二</SelectItem>
                  <SelectItem value="周三">周三</SelectItem>
                  <SelectItem value="周四">周四</SelectItem>
                  <SelectItem value="周五">周五</SelectItem>
                  <SelectItem value="周六">周六</SelectItem>
                  <SelectItem value="周日">周日</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>开始时间</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择开始时间" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>结束时间</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择结束时间" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="class_monitor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>班长学号</FormLabel>
              <FormControl>
                <StudentSearchInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="搜索班长学号或姓名..."
                  excludeIds={[
                    ...(form.watch('deputy_monitors') || []),
                    ...(form.watch('care_officers') || [])
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dynamic Deputy Monitors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>副班长</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCadreRole('deputy_monitors')}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              添加副班长
            </Button>
          </div>
          {(form.watch('deputy_monitors') || []).map((_, index) => (
            <div key={`deputy-${index}`} className="flex gap-2">
              <FormField
                control={form.control}
                name={`deputy_monitors.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <StudentSearchInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="搜索副班长学号或姓名..."
                        excludeIds={[
                          form.watch('class_monitor_id'),
                          ...(form.watch('deputy_monitors') || []).filter((_, i) => i !== index),
                          ...(form.watch('care_officers') || [])
                        ].filter(Boolean)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCadreRole('deputy_monitors', index)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Dynamic Care Officers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>关怀员</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addCadreRole('care_officers')}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              添加关怀员
            </Button>
          </div>
          {(form.watch('care_officers') || []).map((_, index) => (
            <div key={`care-${index}`} className="flex gap-2">
              <FormField
                control={form.control}
                name={`care_officers.${index}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <StudentSearchInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="搜索关怀员学号或姓名..."
                        excludeIds={[
                          form.watch('class_monitor_id'),
                          ...(form.watch('deputy_monitors') || []),
                          ...(form.watch('care_officers') || []).filter((_, i) => i !== index)
                        ].filter(Boolean)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeCadreRole('care_officers', index)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Class Student Management */}
        <FormField
          control={form.control}
          name="student_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>班级学员</span>
                <span className="text-sm text-gray-500 font-normal">
                  {field.value?.length || 0} 名学员
                </span>
              </FormLabel>
              <FormControl>
                <StudentMultiSelect
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="选择班级学员..."
                  excludeIds={[
                    form.watch('class_monitor_id'),
                    ...(form.watch('deputy_monitors') || []),
                    ...(form.watch('care_officers') || [])
                  ].filter(Boolean)}
                />
              </FormControl>
              <FormMessage />
              <div className="text-xs text-gray-500 mt-1">
                班长和干部不会显示在此列表中，他们自动成为班级成员
              </div>
            </FormItem>
          )}
        />


        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            {initialData ? '更新班级' : '创建班级'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClassForm;
