
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, Hash, TrendingUp } from 'lucide-react';

interface AttendanceProgressData {
  learning_progress: string;
  page_number: string;
  line_number: string;
}

interface AttendanceProgressFormProps {
  classId: string;
  classDate?: Date;
  onDataChange: (data: AttendanceProgressData) => void;
}

const AttendanceProgressForm: React.FC<AttendanceProgressFormProps> = ({ 
  classId, 
  classDate, 
  onDataChange 
}) => {
  const [formData, setFormData] = useState<AttendanceProgressData>({
    learning_progress: '',
    page_number: '',
    line_number: '',
  });

  const handleInputChange = (field: keyof AttendanceProgressData, value: string) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedData);
    onDataChange(updatedData);
  };

  const handleNumberInputChange = (field: 'page_number' | 'line_number', value: string) => {
    // Only allow numeric input
    if (value === '' || /^\d+$/.test(value)) {
      const updatedData = {
        ...formData,
        [field]: value
      };
      setFormData(updatedData);
      onDataChange(updatedData);
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
        <div className="space-y-4">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceProgressForm;
