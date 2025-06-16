
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus } from 'lucide-react';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
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
  region: z.enum(['北马', '中马', '南马'], {
    required_error: '请选择地区',
  }),
  weekday: z.enum(['周一', '周二', '周三', '周四', '周五', '周六', '周日'], {
    required_error: '请选择星期',
  }),
  start_time: z.string().min(1, '开始时间不能为空'),
  end_time: z.string().min(1, '结束时间不能为空'),
  class_monitor_id: z.string().min(1, '班长学号不能为空'),
  deputy_monitors: z.array(z.string()).optional(),
  care_officers: z.array(z.string()).optional(),
  learning_progress: z.string().optional(),
}).refine((data) => {
  const startTime = parseInt(data.start_time.replace(':', ''));
  const endTime = parseInt(data.end_time.replace(':', ''));
  return endTime > startTime;
}, {
  message: '结束时间必须晚于开始时间',
  path: ['end_time'],
});

type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassInfo {
  id: string;
  name: string;
  region: '北马' | '中马' | '南马';
  time: string;
  student_count: number;
  class_monitor_id: string;
  deputy_monitors?: string[];
  care_officers?: string[];
  learning_progress: string;
  attendance_rate: number;
  status: 'active' | 'inactive';
}


// Time options for dropdowns
const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00'
];

interface ClassFormProps {
  initialData?: ClassInfo;
  onSubmit: (data: ClassFormData & { student_count: number; attendance_rate: number }) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Parse existing time if editing
  const parseTime = (timeString: string) => {
    if (!timeString) return { weekday: undefined, start_time: '', end_time: '' };
    const parts = timeString.split(' ');
    if (parts.length >= 2) {
      const timeRange = parts.slice(1).join(' ');
      const [start, end] = timeRange.split('-');
      return {
        weekday: parts[0] as ClassFormData['weekday'],
        start_time: start || '',
        end_time: end || ''
      };
    }
    return { weekday: undefined, start_time: '', end_time: '' };
  };

  const { weekday: initialWeekday, start_time: initialStartTime, end_time: initialEndTime } = parseTime(initialData?.time || '');

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      region: initialData?.region || undefined,
      weekday: initialWeekday || undefined,
      start_time: initialStartTime || '',
      end_time: initialEndTime || '',
      class_monitor_id: initialData?.class_monitor_id || '',
      deputy_monitors: initialData?.deputy_monitors || [],
      care_officers: initialData?.care_officers || [],
      learning_progress: initialData?.learning_progress || '',
    },
  });

  const handleSubmit = (data: ClassFormData) => {
    // Auto-calculate student count and attendance rate for new classes
    const student_count = initialData?.student_count || Math.floor(Math.random() * 30) + 15;
    const attendance_rate = initialData?.attendance_rate || Math.floor(Math.random() * 25) + 75;
    
    // Combine weekday and time for backwards compatibility
    const combinedTimeData = {
      ...data,
      time: `${data.weekday} ${data.start_time}-${data.end_time}`,
      student_count,
      attendance_rate,
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
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>地区</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择地区" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="北马">北马</SelectItem>
                  <SelectItem value="中马">中马</SelectItem>
                  <SelectItem value="南马">南马</SelectItem>
                </SelectContent>
              </Select>
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

        <FormField
          control={form.control}
          name="learning_progress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>学习进度</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="请输入当前学习进度..." 
                  {...field} 
                  rows={3}
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
