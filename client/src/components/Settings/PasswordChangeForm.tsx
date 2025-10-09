
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { supabase } from '@/lib/supabase';

const PasswordChangeForm: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, authMode } = useHybridAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: '密码不匹配',
        description: '新密码和确认密码不一致，请重新输入',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: '密码太短',
        description: '新密码长度至少需要6位字符',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'supabase') {
        if (!user?.email) {
          throw new Error('无法获取当前用户邮箱，无法修改密码');
        }

        // Re-authenticate to verify the current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          toast({
            title: '密码修改失败',
            description: '当前密码不正确，请重试',
            variant: 'destructive',
          });
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw new Error(updateError.message);
        }

        toast({
          title: '密码修改成功',
          description: '您的密码已成功更新',
        });
      } else {
        // Legacy mock flow for local testing
        if (currentPassword !== 'password') {
          toast({
            title: '密码修改失败',
            description: '当前密码不正确，请重试',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: '密码修改成功',
          description: '您的密码已成功更新 (模拟环境)',
        });
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '密码修改失败，请稍后重试';
      toast({
        title: '系统错误',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <CardDescription>
          更新您的账户密码以确保安全
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="输入当前密码"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="输入新密码"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认新密码</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? '修改中...' : '修改密码'}
          </Button>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">提示：</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• 密码长度至少需要6位字符</p>
            <p>• 建议使用字母、数字和特殊字符的组合</p>
            <p>• 当前测试密码为：password</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PasswordChangeForm;
