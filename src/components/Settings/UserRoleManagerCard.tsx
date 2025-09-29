import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronDown, Loader2, RefreshCcw, UserCog, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/contexts/DatabaseContext';
import { useHybridAuth } from '@/hooks/useHybridAuth';
import MainBranchSearchInput from '@/components/Branches/MainBranchSearchInput';
import SubBranchSearchInput from '@/components/Classes/SubBranchSearchInput';
import ClassSearchInput from '@/components/Classes/ClassSearchInput';
import StudentSearchInput from '@/components/Students/StudentSearchInput';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { listUsers as listUsersApi, updateUserRole as updateUserRoleApi } from '@/lib/api/adminUsers';

type SupportedRole = 'student' | 'class_admin' | 'branch_admin' | 'state_admin' | 'super_admin';

const ROLE_OPTIONS: { value: SupportedRole; label: string }[] = [
  { value: 'student', label: '学员 (Student)' },
  { value: 'class_admin', label: '班级管理员 (Class Admin)' },
  { value: 'branch_admin', label: '分院管理员 (Branch Admin)' },
  { value: 'state_admin', label: '州属分院管理员 (State Branch Admin)' },
  { value: 'super_admin', label: '超级管理员 (Super Admin)' },
];

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch (jsonError) {
    return '发生未知错误';
  }
};

interface RoleFormState {
  role: SupportedRole | '';
  studentId: string;
  scopeType: string;
  scopeId: string;
  mainBranchId: string;
  subBranchId: string;
  classId: string;
  className: string;
}

const emptyState: RoleFormState = {
  role: '',
  studentId: '',
  scopeType: '',
  scopeId: '',
  mainBranchId: '',
  subBranchId: '',
  classId: '',
  className: '',
};

const showRoleManager = import.meta.env.VITE_USE_SERVICE_ROLE === 'true';

const UserRoleManagerCard: React.FC = () => {
  if (!showRoleManager) {
    return null;
  }

  const { toast } = useToast();
  const { user: currentUser } = useHybridAuth();
  const { classes } = useDatabase();

  const [users, setUsers] = useState<SupabaseUser[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [userPickerOpen, setUserPickerOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [formState, setFormState] = useState<RoleFormState>(emptyState);
  const [initialState, setInitialState] = useState<RoleFormState>(emptyState);
  const [isSaving, setIsSaving] = useState(false);

  const canManage = currentUser?.role === 'super_admin';

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || null,
    [users, selectedUserId]
  );

  const classOptionsById = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((cls) => {
      map.set(cls.id, cls.name);
    });
    return map;
  }, [classes]);

  const fetchUsers = useCallback(async () => {
    setIsFetchingUsers(true);
    setFetchError(null);
    try {
      const data = await listUsersApi();
      setUsers((data as { users?: SupabaseUser[] }).users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      const rawMessage = getErrorMessage(error) || '无法获取用户列表';
      const friendlyMessage = rawMessage === 'admin_endpoint_not_found'
        ? '未找到后台角色管理接口，请确保部署了 admin-users API。'
        : rawMessage === 'invalid_json_response'
          ? '角色管理接口返回了无效响应，请检查后端部署。'
          : rawMessage;
      setFetchError(friendlyMessage);
      toast({
        title: '获取用户失败',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsFetchingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    if (canManage) {
      fetchUsers();
    }
  }, [canManage, fetchUsers]);

  useEffect(() => {
    if (!selectedUser) {
      setFormState(emptyState);
      setInitialState(emptyState);
      return;
    }

    const metadata = (selectedUser.app_metadata || {}) as Record<string, unknown>;
    const role = (metadata.role as SupportedRole | undefined) || '';
    const studentId = (metadata.student_id as string | undefined) || '';
    const scopeType = (metadata.scope_type as string | undefined) || '';
    const scopeIdRaw = metadata.scope_id as string | number | undefined;
    const scopeId = scopeIdRaw !== undefined && scopeIdRaw !== null ? String(scopeIdRaw) : '';

    let mainBranchId = '';
    let subBranchId = '';
    let classId = '';
    let className = '';

    if (scopeType === 'main_branch') {
      mainBranchId = scopeId;
    } else if (scopeType === 'sub_branch') {
      subBranchId = scopeId;
    } else if (scopeType === 'class') {
      classId = scopeId;
      className = classOptionsById.get(scopeId) || '';
    }

    const nextState: RoleFormState = {
      role,
      studentId,
      scopeType,
      scopeId,
      mainBranchId,
      subBranchId,
      classId,
      className,
    };

    setFormState(nextState);
    setInitialState(nextState);
  }, [selectedUser, classOptionsById]);

  const filteredUsers = useMemo(() => {
    const term = userSearchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => {
      const emailMatch = u.email?.toLowerCase().includes(term);
      const idMatch = u.user_metadata?.student_id?.toLowerCase().includes(term);
      const nameMatch = (u.user_metadata?.chinese_name || u.user_metadata?.english_name || '')
        .toLowerCase()
        .includes(term);
      return emailMatch || idMatch || nameMatch;
    });
  }, [users, userSearchTerm]);

  const handleRoleChange = (value: SupportedRole) => {
    setFormState((prev) => {
      const resetScope = {
        scopeId: '',
        mainBranchId: '',
        subBranchId: '',
        classId: '',
        className: '',
      };

      if (value === 'state_admin') {
        return {
          ...prev,
          role: value,
          scopeType: 'main_branch',
          ...resetScope,
        };
      }

      if (value === 'branch_admin') {
        return {
          ...prev,
          role: value,
          scopeType: 'sub_branch',
          ...resetScope,
        };
      }

      if (value === 'class_admin') {
        return {
          ...prev,
          role: value,
          scopeType: 'class',
          ...resetScope,
        };
      }

      return {
        ...prev,
        role: value,
        scopeType: '',
        ...resetScope,
      };
    });
  };

  const handleMainBranchChange = (branchId: string) => {
    setFormState((prev) => ({
      ...prev,
      mainBranchId: branchId,
      scopeId: branchId,
    }));
  };

  const handleSubBranchChange = (branchId: string, _branchName?: string) => {
    setFormState((prev) => ({
      ...prev,
      subBranchId: branchId,
      scopeId: branchId,
    }));
  };

  const handleClassChange = (className: string) => {
    const classRecord = classes.find((cls) => cls.name === className);
    const classId = classRecord ? classRecord.id : '';
    setFormState((prev) => ({
      ...prev,
      className,
      classId,
      scopeId: classId,
    }));
  };

  const resetFormToInitial = () => {
    setFormState(initialState);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) {
      toast({
        title: '请选择用户',
        description: '请先从列表中选择需要修改的用户',
        variant: 'destructive',
      });
      return;
    }

    if (!formState.role) {
      toast({
        title: '请选择角色',
        description: '角色为必填项',
        variant: 'destructive',
      });
      return;
    }

    if (formState.role === 'state_admin' && !formState.mainBranchId) {
      toast({
        title: '请选择州属分院',
        description: '州属分院管理员必须指定负责的州属分院',
        variant: 'destructive',
      });
      return;
    }

    if (formState.role === 'branch_admin' && !formState.subBranchId) {
      toast({
        title: '请选择分院',
        description: '分院管理员必须指定负责的分院',
        variant: 'destructive',
      });
      return;
    }

    if (formState.role === 'class_admin' && !formState.classId) {
      toast({
        title: '请选择班级',
        description: '班级管理员必须指定管理的班级',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateUserRoleApi({
        userId: selectedUser.id,
        role: formState.role,
        studentId: formState.studentId || undefined,
        scopeType: formState.scopeType || undefined,
        scopeId: formState.scopeId || undefined,
      });

      toast({
        title: '角色更新成功',
        description: `${selectedUser.email} 的角色已更新`,
      });

      await fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      const rawMessage = getErrorMessage(error);
      const friendlyMessage = rawMessage === 'student_not_found'
        ? '找不到提供的学员ID，请确认输入正确'
        : rawMessage === 'admin_endpoint_not_found'
          ? '未找到后台角色管理接口，请检查部署配置。'
          : rawMessage === 'invalid_json_response'
            ? '角色管理接口返回了无效响应，请检查后端部署。'
            : (rawMessage || '请稍后重试');
      toast({
        title: '角色更新失败',
        description: friendlyMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!canManage) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" />
          管理用户角色
        </CardTitle>
        <CardDescription>
          搜索现有用户并更新其角色、管理范围或学员绑定信息
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {fetchError && (
          <Alert variant="destructive">
            <AlertTitle>无法加载用户</AlertTitle>
            <AlertDescription>{fetchError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label className="font-medium">选择用户</Label>
          <Popover open={userPickerOpen} onOpenChange={setUserPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-left ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                {selectedUser ? (
                  <span className="flex flex-col">
                    <span className="font-medium text-gray-900">{selectedUser.email}</span>
                    <span className="text-xs text-gray-500">
                      {selectedUser.app_metadata?.role || '未设置角色'}
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-500">点击选择用户</span>
                )}
                <span className="flex items-center gap-1">
                  {selectedUser && (
                    <button
                      type="button"
                      className="rounded-full p-1 hover:bg-muted"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedUserId('');
                        setFormState(emptyState);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="搜索邮箱、姓名或学员ID..."
                  value={userSearchTerm}
                  onValueChange={setUserSearchTerm}
                />
                <CommandList>
                  {isFetchingUsers ? (
                    <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      加载用户中...
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>未找到匹配的用户</CommandEmpty>
                      <CommandGroup>
                        {filteredUsers.map((u) => (
                          <CommandItem
                            key={u.id}
                            value={u.email || u.id}
                            onSelect={() => {
                              setSelectedUserId(u.id);
                              setUserPickerOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${u.id === selectedUserId ? 'opacity-100' : 'opacity-0'}`}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{u.email}</span>
                              <span className="text-xs text-gray-500">
                                {u.app_metadata?.role || '未设置角色'} • 学员ID: {u.app_metadata?.student_id || '未绑定'}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {selectedUser && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>当前角色</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="secondary">{selectedUser.app_metadata?.role || '未设置'}</Badge>
                  <span className="text-xs text-gray-500">UID: {selectedUser.id}</span>
                </div>
              </div>
              <div>
                <Label>邮箱</Label>
                <p className="mt-2 text-sm text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>绑定学员ID（可选）</Label>
                <StudentSearchInput
                  value={formState.studentId}
                  onChange={(studentId) => setFormState((prev) => ({ ...prev, studentId: studentId.trim() }))}
                  placeholder="搜索学员编号或姓名"
                />
                <p className="text-xs text-muted-foreground">用于将系统账户与学员资料关联</p>
              </div>

              <div className="space-y-2">
                <Label>目标角色</Label>
                <Select value={formState.role} onValueChange={(value: SupportedRole) => handleRoleChange(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择角色" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formState.role === 'state_admin' && (
              <div className="space-y-2">
                <Label>负责州属分院</Label>
                <MainBranchSearchInput
                  value={formState.mainBranchId}
                  onChange={handleMainBranchChange}
                  placeholder="请选择负责的州属分院"
                />
              </div>
            )}

            {formState.role === 'branch_admin' && (
              <div className="space-y-2">
                <Label>负责分院</Label>
                <SubBranchSearchInput
                  value={formState.subBranchId}
                  onChange={handleSubBranchChange}
                  placeholder="搜索并选择分院"
                />
              </div>
            )}

            {formState.role === 'class_admin' && (
              <div className="space-y-2">
                <Label>负责班级</Label>
                <ClassSearchInput
                  value={formState.className}
                  onChange={handleClassChange}
                  placeholder="搜索并选择班级"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUserSearchTerm('');
                  fetchUsers();
                }}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                重新加载用户
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetFormToInitial}
                  disabled={isSaving}
                >
                  重置更改
                </Button>
                <Button type="button" onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    '保存更改'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserRoleManagerCard;
