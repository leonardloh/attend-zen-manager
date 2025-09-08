
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const LoginForm: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(studentId, password);
      if (!success) {
        toast({
          title: '登录失败',
          description: '学号或密码错误，请重试',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '登录错误',
        description: '系统错误，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            考勤管理系统
          </CardTitle>
          <CardDescription>
            Attendance Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">学号 / Student ID</Label>
              <Input
                id="studentId"
                type="text"
                placeholder="输入您的学号"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码 / Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="输入您的密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录 / Login'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">测试账号 / Test Accounts:</p>
            <div className="space-y-1 text-xs">
              <p><strong>超级管理员:</strong> admin001 / password</p>
              <p><strong>干部:</strong> cadre001 / password</p>
              <p><strong>学员:</strong> student001 / password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
