
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Hash, TrendingUp, Save } from 'lucide-react';

interface AttendanceProgressData {
  learning_progress: string;
  page_number: string;
  line_number: string;
}

interface AttendanceProgressFormProps {
  classId: string;
  classDate?: Date;
  onSave: (data: AttendanceProgressData) => void;
}

const AttendanceProgressForm: React.FC<AttendanceProgressFormProps> = ({ 
  classId, 
  classDate, 
  onSave 
}) => {
  const [formData, setFormData] = useState<AttendanceProgressData>({
    learning_progress: '',
    page_number: '',
    line_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof AttendanceProgressData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumberInputChange = (field: 'page_number' | 'line_number', value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          更新班级学习进度
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="learning_progress" className="block text-sm font-medium text-gray-700 mb-2">
              学习进度 / Learning Progress
            </Label>
            <Textarea
              id="learning_progress"
              placeholder="请输入今日学习进度..."
              value={formData.learning_progress}
              onChange={(e) => handleInputChange('learning_progress', e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page_number" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4" />
                广论页数
              </Label>
              <Input
                id="page_number"
                type="text"
                placeholder="请输入页数（仅数字）"
                value={formData.page_number}
                onChange={(e) => handleNumberInputChange('page_number', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="line_number" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Hash className="h-4 w-4" />
                广论行数
              </Label>
              <Input
                id="line_number"
                type="text"
                placeholder="请输入行数（仅数字）"
                value={formData.line_number}
                onChange={(e) => handleNumberInputChange('line_number', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              保存进度
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceProgressForm;
