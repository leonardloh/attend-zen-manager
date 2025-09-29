import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getInvitationByToken, acceptInvitation, createUserRole, isInvitationValid } from '@/lib/database/invitations';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle, UserPlus } from 'lucide-react';

interface InvitationData {
  id: string;
  email: string;
  student_id?: string;
  role: string;
  scope_type?: string;
  scope_id?: number;
  expires_at: string;
  accepted_at?: string;
}

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      fetchInvitation();
    } else {
      setError('无效的邀请链接');
      setIsLoading(false);
    }
  }, [token]);

  const fetchInvitation = async () => {
    if (!token) return;

    try {
      const invitationData = await getInvitationByToken(token);
      
      if (!invitationData) {
        setError('邀请不存在或已失效');
        setIsLoading(false);
        return;
      }

      if (!isInvitationValid(invitationData)) {
        setError('邀请已过期或已被接受');
        setIsLoading(false);
        return;
      }

      setInvitation(invitationData);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError('获取邀请信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation || !token) return;

    if (password !== confirmPassword) {
      setError('密码确认不匹配');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            student_id: invitation.student_id,
            invited: true,
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('创建用户账户失败');
      }

      // Mark invitation as accepted
      const accepted = await acceptInvitation(token);
      if (!accepted) {
        throw new Error('更新邀请状态失败');
      }

      // Create user role
      const roleCreated = await createUserRole(
        authData.user.id,
        invitation.role,
        invitation.scope_type,
        invitation.scope_id
      );

      if (!roleCreated) {
        console.warn('Failed to create user role, but invitation was accepted');
      }

      toast({
        title: '账户创建成功',
        description: '您的账户已成功创建，请登录',
      });

      // Redirect to login page
      navigate('/login?message=account-created');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setError(error.message || '接受邀请失败，请稍后重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      student: '学员',
      class_admin: '班级管理员',
      branch_admin: '分院管理员',
      state_admin: '州属管理员',
      super_admin: '超级管理员',
    };
    return roleMap[role] || role;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              邀请无效
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                返回登录页面
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            接受邀请
          </CardTitle>
          <CardDescription>
            您已被邀请加入 Attend Zen Manager 系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">邀请详情</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>邮箱：</strong>{invitation.email}</p>
              {invitation.student_id && (
                <p><strong>学员ID：</strong>{invitation.student_id}</p>
              )}
              <p><strong>角色：</strong>{getRoleLabel(invitation.role)}</p>
              {invitation.scope_type && invitation.scope_id && (
                <p><strong>管理范围：</strong>{invitation.scope_type} #{invitation.scope_id}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">设置密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码（至少6个字符）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  创建账户中...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  接受邀请并创建账户
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;