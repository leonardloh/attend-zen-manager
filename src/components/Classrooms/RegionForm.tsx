import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import type { Region } from '@/pages/Classrooms';

interface RegionFormProps {
  initialData?: Region;
  onSubmit: (region: Region | Omit<Region, 'id'>) => void;
  onCancel: () => void;
}

const RegionForm: React.FC<RegionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    states: initialData?.states || [],
    created_date: initialData?.created_date || new Date().toISOString().split('T')[0]
  });

  const [newState, setNewState] = useState('');

  // Available Malaysian states
  const availableStates = [
    '槟城', '玻璃市', '霹雳', '吉打', '登嘉楼', '吉兰丹', 
    '彭亨', '雪隆', '森美兰', '马六甲', '柔佛', '沙巴', '砂拉越', '纳闽'
  ];

  const addState = (state: string) => {
    if (state && !formData.states.includes(state)) {
      setFormData({
        ...formData,
        states: [...formData.states, state]
      });
      setNewState('');
    }
  };

  const removeState = (stateToRemove: string) => {
    setFormData({
      ...formData,
      states: formData.states.filter(state => state !== stateToRemove)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.code) {
      alert('请填写所有必填字段 (Please fill in all required fields)');
      return;
    }

    // Validate that at least one state is selected
    if (formData.states.length === 0) {
      alert('请至少添加一个州属 (Please add at least one state)');
      return;
    }
    
    if (initialData) {
      onSubmit({ ...formData, id: initialData.id });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">地区基本信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">地区名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如: 北马"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">地区代码 *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="例如: NM"
              maxLength={3}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">地区描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="地区的详细描述，包括管理的州属等..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="created_date">创建日期 *</Label>
          <Input
            id="created_date"
            type="date"
            value={formData.created_date}
            onChange={(e) => setFormData({ ...formData, created_date: e.target.value })}
            required
          />
        </div>

        {/* State Management Section */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-lg font-medium text-gray-900">州属管理</h4>
          <p className="text-sm text-gray-600">管理该地区下的州属</p>
          
          {/* Add New State */}
          <div className="flex gap-2">
            <Select value={newState} onValueChange={setNewState}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="选择要添加的州属" />
              </SelectTrigger>
              <SelectContent>
                {availableStates
                  .filter(state => !formData.states.includes(state))
                  .map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              type="button" 
              onClick={() => addState(newState)}
              disabled={!newState || formData.states.includes(newState)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              添加
            </Button>
          </div>

          {/* Current States */}
          <div className="space-y-2">
            <Label>当前州属 ({formData.states.length})</Label>
            <div className="flex flex-wrap gap-2">
              {formData.states.map((state, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {state}
                  <button
                    type="button"
                    onClick={() => removeState(state)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {formData.states.length === 0 && (
              <p className="text-sm text-gray-500">请添加至少一个州属</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="flex-1">
          {initialData ? '更新地区' : '添加地区'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          取消
        </Button>
      </div>
    </form>
  );
};

export default RegionForm;