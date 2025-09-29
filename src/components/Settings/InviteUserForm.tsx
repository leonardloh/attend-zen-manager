import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { Loader2, Mail, UserPlus } from 'lucide-react';
import MainBranchSearchInput from '@/components/Branches/MainBranchSearchInput';
import StudentSearchInput from '@/components/Students/StudentSearchInput';

interface InviteUserFormProps {
  onInviteSent?: () => void;
}

const InviteUserForm: React.FC<InviteUserFormProps> = ({ onInviteSent }) => {
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<string>('');
  const [scopeType, setScopeType] = useState<string>('');
  const [scopeId, setScopeId] = useState<string>('');
  const [mainBranchId, setMainBranchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useHybridAuth();
  const { toast } = useToast();

  const roleOptions = [
    { value: 'student', label: '学员 (Student)' },
    { value: 'class_admin', label: '班级管理员 (Class Admin)' },
    { value: 'branch_admin', label: '分院管理员 (Branch Admin)' },
    { value: 'state_admin', label: '州属分院管理员 (State Branch Admin)' },
    { value: 'super_admin', label: '超级管理员 (Super Admin)' },
  ];

  const scopeTypeOptions = [
    { value: 'class', label: '班级 (Class)' },
    { value: 'sub_branch', label: '分院 (Sub Branch)' },
    { value: 'main_branch', label: '总院 (Main Branch)' },
  ];

  const handleRoleChange = (value: string) => {
    setRole(value);

    if (value === 'state_admin') {
      setScopeType('main_branch');
      setScopeId(mainBranchId ? mainBranchId : '');
    } else {
      setScopeType('');
      setScopeId('');
      setMainBranchId('');
    }
  };

  const handleMainBranchChange = (branchId: string) => {
    setMainBranchId(branchId);
    if (branchId) {
      setScopeType('main_branch');
      setScopeId(branchId);
    } else {
      setScopeType('');
      setScopeId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      toast({
        title: '请填写必填字段',
        description: '邮箱和角色是必填的',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: '用户未登录',
        description: '请先登录后再创建用户',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const isStateAdmin = role === 'state_admin';
      const scopeIsRequired = ['class_admin', 'branch_admin'].includes(role);

      if (isStateAdmin && !mainBranchId) {
        toast({
          title: '请选择负责的州属分院',
          description: '州属分院管理员必须指定负责的州属分院',
          variant: 'destructive',
        });
        return;
      }

      if (scopeIsRequired && (!scopeType || !scopeId)) {
        toast({
          title: '请设置管理范围',
          description: '请选择管理范围类型并提供对应的ID',
          variant: 'destructive',
        });
        return;
      }

      // For development: Mock the invitation process
      console.log('🔧 Development Mode: Mocking user invitation');
      console.log('📧 Email:', email);
      console.log('👤 Student ID:', studentId);
      console.log('🎭 Role:', role);
      console.log('📍 Scope:', scopeType, scopeId);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful invitation
      const mockUserId = `mock-user-${Date.now()}`;
      
      console.log('✅ Mock invitation created successfully');
      console.log('🔗 Invitation link would be:', `${window.location.origin}/set-password?access_token=mock-token&refresh_token=mock-refresh`);
      console.log('👤 Mock user ID:', mockUserId);

      toast({
        title: '邀请发送成功 (开发模式)',
        description: `模拟邀请已创建 - 邮箱: ${email}, 角色: ${role}`,
      });
      
      setEmail('');
      setStudentId('');
      setRole('');
      setScopeType('');
      setScopeId('');
      setMainBranchId('');
      onInviteSent?.();
    } catch (error: any) {
      toast({
        title: '创建用户失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          创建用户
        </CardTitle>
        <CardDescription>
          直接创建新用户账户并分配角色
          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
            🔧 开发模式
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                邮箱地址 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">学员ID (可选)</Label>
              <StudentSearchInput
                value={studentId}
                onChange={setStudentId}
                placeholder="搜索学员编号或姓名"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              角色 <span className="text-red-500">*</span>
            </Label>
            <Select value={role} onValueChange={handleRoleChange} required>
              <SelectTrigger>
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {role === 'state_admin' && (
            <div className="space-y-2">
              <Label>
                负责州属分院 <span className="text-red-500">*</span>
              </Label>
              <MainBranchSearchInput
                value={mainBranchId}
                onChange={handleMainBranchChange}
                placeholder="请选择负责的州属分院"
              />
              <p className="text-xs text-muted-foreground">
                州属分院管理员只能访问所选州属分院及其下属数据。
              </p>
            </div>
          )}

          {role && ['class_admin', 'branch_admin'].includes(role) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scopeType">管理范围类型</Label>
                <Select value={scopeType} onValueChange={setScopeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择范围类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scopeId">范围ID</Label>
                <Input
                  id="scopeId"
                  type="number"
                  placeholder="输入对应的ID"
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  创建用户
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default InviteUserForm;
