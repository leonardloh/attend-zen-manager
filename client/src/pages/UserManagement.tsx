import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Search, UserCog, Loader2 } from 'lucide-react';
import { useHybridAuth } from '@/hooks/useHybridAuth';

interface UserData {
  id: string;
  email: string;
  role: string;
  user_metadata?: {
    chinese_name?: string;
    english_name?: string;
    student_id?: string;
  };
}

const UserManagement = () => {
  const { user } = useHybridAuth();
  const { toast } = useToast();
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [foundUser, setFoundUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const roleOptions = [
    { value: 'student', label: 'Student / 学员' },
    { value: 'class_admin', label: 'Class Admin / 班级管理员' },
    { value: 'branch_admin', label: 'Branch Admin / 分行管理员' },
    { value: 'state_admin', label: 'State Admin / 州管理员' },
    { value: 'super_admin', label: 'Super Admin / 超级管理员' },
  ];

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: '请输入邮箱',
        description: 'Please enter an email address to search',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);
    try {
      // Get user by email from auth.users table
      const { data, error } = await supabase.rpc('get_user_by_email', {
        search_email: searchEmail.trim().toLowerCase()
      });

      if (error) {
        console.error('Search error:', error);
        toast({
          title: '搜索失败',
          description: error.message || 'Failed to search for user',
          variant: 'destructive',
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: '未找到用户',
          description: 'No user found with this email address',
          variant: 'destructive',
        });
        setFoundUser(null);
        setSelectedRole('');
        return;
      }

      const userData = data[0];
      setFoundUser(userData);
      setSelectedRole(userData.role || 'student');
      
      toast({
        title: '用户已找到',
        description: `Found user: ${userData.email}`,
      });
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: '搜索错误',
        description: error.message || 'An error occurred while searching',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!foundUser || !selectedRole) {
      toast({
        title: '请选择角色',
        description: 'Please select a role to assign',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update user metadata with new role
      const { error } = await supabase.rpc('update_user_role', {
        user_id: foundUser.id,
        new_role: selectedRole
      });

      if (error) {
        console.error('Update error:', error);
        toast({
          title: '更新失败',
          description: error.message || 'Failed to update user role',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '角色已更新',
        description: `User role has been updated to ${selectedRole}`,
      });

      // Refresh user data
      handleSearch();
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: '更新错误',
        description: error.message || 'An error occurred while updating',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Only allow super_admin and state_admin to access this page
  if (user?.role !== 'super_admin' && user?.role !== 'state_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>访问受限</CardTitle>
            <CardDescription>您没有权限访问此页面</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Access Denied: You do not have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">用戶管理</h1>
        <p className="text-gray-600">User Management</p>
      </div>

      <div className="grid gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              搜索用户 / Search User
            </CardTitle>
            <CardDescription>
              输入注册邮箱以搜索用户 / Enter registered email to search for user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  data-testid="input-search-email"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                data-testid="button-search-user"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    搜索中...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    搜索
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Details and Role Assignment */}
        {foundUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                用户信息与角色管理 / User Information & Role Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Information Display */}
              <div className="grid gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-600">邮箱 / Email</Label>
                  <p className="text-sm font-semibold" data-testid="text-user-email">{foundUser.email}</p>
                </div>
                {foundUser.user_metadata?.chinese_name && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">中文姓名 / Chinese Name</Label>
                    <p className="text-sm font-semibold" data-testid="text-user-chinese-name">
                      {foundUser.user_metadata.chinese_name}
                    </p>
                  </div>
                )}
                {foundUser.user_metadata?.english_name && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">英文姓名 / English Name</Label>
                    <p className="text-sm font-semibold" data-testid="text-user-english-name">
                      {foundUser.user_metadata.english_name}
                    </p>
                  </div>
                )}
                {foundUser.user_metadata?.student_id && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">学员编号 / Student ID</Label>
                    <p className="text-sm font-semibold" data-testid="text-user-student-id">
                      {foundUser.user_metadata.student_id}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-600">当前角色 / Current Role</Label>
                  <p className="text-sm font-semibold text-blue-600" data-testid="text-user-current-role">
                    {roleOptions.find(r => r.value === foundUser.role)?.label || foundUser.role || 'student'}
                  </p>
                </div>
              </div>

              {/* Role Assignment */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">分配新角色 / Assign New Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                  >
                    <SelectTrigger id="role" data-testid="select-user-role">
                      <SelectValue placeholder="选择角色 / Select Role" />
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

                <Button 
                  onClick={handleUpdateRole} 
                  disabled={isUpdating || selectedRole === foundUser.role}
                  className="w-full"
                  data-testid="button-update-role"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    '更新角色 / Update Role'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
