
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  time: z.string().min(1, '上课时间不能为空'),
  class_monitor: z.string().min(1, '班长姓名不能为空'),
  learning_progress: z.string().min(1, '学习进度不能为空'),
});

type ClassFormData = z.infer<typeof classFormSchema>;

interface ClassFormProps {
  onSubmit: (data: ClassFormData & { student_count: number; attendance_rate: number }) => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<ClassFormData>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      region: undefined,
      time: '',
      class_monitor: '',
      learning_progress: '',
    },
  });

  const handleSubmit = (data: ClassFormData) => {
    // Auto-calculate student count (simulated system calculation)
    const student_count = Math.floor(Math.random() * 30) + 15; // Random between 15-45 students
    
    // Auto-populate attendance rate (simulated frontend calculation)
    const attendance_rate = Math.floor(Math.random() * 25) + 75; // Random between 75-100%
    
    onSubmit({
      ...data,
      student_count,
      attendance_rate,
    });
    form.reset();
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>上课时间</FormLabel>
              <FormControl>
                <Input placeholder="例：周一 09:00-11:00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_monitor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>班长姓名</FormLabel>
              <FormControl>
                <Input placeholder="请输入班长姓名" {...field} />
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
                  placeholder="请描述当前学习进度"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Info section about auto-populated fields */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-2">
            <strong>自动填充字段：</strong>
          </p>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>• 学生人数：系统自动计算</li>
            <li>• 出席率：前端自动生成</li>
          </ul>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            创建班级
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
