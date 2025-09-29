import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import { getInvitations, resendInvitation, cancelInvitation } from '@/lib/api/invitations';
import { Mail, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Invitation {
  id: string;
  email: string;
  student_id?: string;
  role: string;
  scope_type?: string;
  scope_id?: number;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  invited_by: {
    chinese_name?: string;
    english_name?: string;
  };
}

const InvitationList: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useHybridAuth();

  useEffect(() => {
    if (user?.id) {
      fetchInvitations();
    }
  }, [user?.id]);

  const fetchInvitations = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getInvitations(user.id);
      setInvitations(data);
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const result = await resendInvitation(invitationId);
      
      if (result.success) {
        toast({
          title: '邀请重新发送成功',
          description: '邀请邮件已重新发送',
        });
        fetchInvitations();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: '重新发送失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const result = await cancelInvitation(invitationId);
      
      if (result.success) {
        toast({
          title: '邀请已取消',
          description: '邀请已被成功取消',
        });
        fetchInvitations();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: '取消邀请失败',
        description: error.message || '请稍后重试',
        variant: 'destructive',
      });
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

  const getStatusBadge = (invitation: Invitation) => {
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    const acceptedAt = invitation.accepted_at;

    if (acceptedAt) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          已接受
        </Badge>
      );
    }

    if (expiresAt < now) {
      return (
        <Badge variant="destructive">
          <XCircle className="w-3 h-3 mr-1" />
          已过期
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        待接受
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>邀请记录</CardTitle>
          <CardDescription>查看所有发送的邀请</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>邀请记录</CardTitle>
        <CardDescription>查看所有发送的邀请</CardDescription>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>暂无邀请记录</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>邮箱</TableHead>
                  <TableHead>学员ID</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>管理范围</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>发送时间</TableHead>
                  <TableHead>过期时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{invitation.student_id || '-'}</TableCell>
                    <TableCell>{getRoleLabel(invitation.role)}</TableCell>
                    <TableCell>
                      {invitation.scope_type && invitation.scope_id
                        ? `${invitation.scope_type} #${invitation.scope_id}`
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(invitation)}</TableCell>
                    <TableCell>
                      {format(new Date(invitation.created_at), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.expires_at), 'yyyy-MM-dd HH:mm', {
                        locale: zhCN,
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!invitation.accepted_at && new Date(invitation.expires_at) > new Date() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            重发
                          </Button>
                        )}
                        {!invitation.accepted_at && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            取消
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvitationList;
