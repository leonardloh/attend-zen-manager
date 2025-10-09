
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

const LoginForm: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchParams] = useSearchParams();
  const { login } = useHybridAuth();
  const { toast } = useToast();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'account-created') {
      setShowSuccessMessage(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    } else if (message === 'invited') {
      setShowSuccessMessage(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    } else if (message === 'password-set') {
      setShowSuccessMessage(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(identifier, password);
      if (!success) {
        toast({
          title: '登录失败',
          description: '邮箱或密码错误，请重试',
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
          {showSuccessMessage && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                账户创建成功！请使用您的邮箱和密码登录。
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">邮箱或学员编号 / Email or Student ID</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="输入您的邮箱或学员编号"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>🔧 开发调试账号:</strong> admin001 / password (超级管理员权限)</p>
              <p><strong>👑 超级管理员:</strong> admin001 / password</p>
              <p><strong>👥 干部账号:</strong> cadre001 / password</p>
              <p><strong>🎓 学员账号:</strong> student001 / password</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
