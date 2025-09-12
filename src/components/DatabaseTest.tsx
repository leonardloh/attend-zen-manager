import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDatabase } from '@/contexts/DatabaseContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ConnectionTest {
  name: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

export const DatabaseTest: React.FC = () => {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Supabase Connection', status: 'idle' },
    { name: 'Students Table', status: 'idle' },
    { name: 'Classes Table', status: 'idle' },
    { name: 'Branches Tables', status: 'idle' },
  ]);

  const { isLoadingStudents, studentsError } = useDatabase();

  const updateTestStatus = (index: number, status: ConnectionTest['status'], message?: string) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message } : test
    ));
  };

  const runTests = async () => {
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'idle', message: undefined })));

    try {
      // Test 1: Basic Supabase connection
      updateTestStatus(0, 'testing');
      const { data, error } = await supabase.from('students').select('count', { count: 'exact' });
      if (error) throw error;
      updateTestStatus(0, 'success', `Connected to Supabase`);

      // Test 2: Students table access
      updateTestStatus(1, 'testing');
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .limit(1);
      if (studentsError) throw studentsError;
      updateTestStatus(1, 'success', `Students table accessible (${data?.[0]?.count || 0} records)`);

      // Test 3: Classes table access
      updateTestStatus(2, 'testing');
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('count', { count: 'exact' })
        .limit(1);
      if (classesError) throw classesError;
      updateTestStatus(2, 'success', `Classes table accessible`);

      // Test 4: Branches tables access
      updateTestStatus(3, 'testing');
      const { data: mainBranches, error: mainBranchesError } = await supabase
        .from('main_branches')
        .select('count', { count: 'exact' })
        .limit(1);
      if (mainBranchesError) throw mainBranchesError;

      const { data: subBranches, error: subBranchesError } = await supabase
        .from('sub_branches')
        .select('count', { count: 'exact' })
        .limit(1);
      if (subBranchesError) throw subBranchesError;
      
      updateTestStatus(3, 'success', `Branch tables accessible`);

      toast.success('所有数据库连接测试通过！');
    } catch (error: unknown) {
      console.error('Database test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Find the current testing item and mark it as error
      setTests(prev => prev.map(test => 
        test.status === 'testing' 
          ? { ...test, status: 'error', message: errorMessage }
          : test
      ));
      
      toast.error(`数据库连接测试失败: ${errorMessage}`);
    }
  };

  const getStatusBadge = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'idle':
        return <Badge variant="secondary">未测试</Badge>;
      case 'testing':
        return <Badge variant="outline" className="animate-pulse">测试中...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">成功</Badge>;
      case 'error':
        return <Badge variant="destructive">失败</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>数据库连接测试</CardTitle>
        <p className="text-sm text-muted-foreground">
          测试与Supabase数据库的连接状态和表访问权限
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runTests} className="w-full">
          运行数据库连接测试
        </Button>
        
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex flex-col">
                <span className="font-medium">{test.name}</span>
                {test.message && (
                  <span className="text-sm text-muted-foreground">{test.message}</span>
                )}
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">数据库配置信息:</h4>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || import.meta.env.REACT_APP_SUPABASE_URL}</div>
            <div>Loading Students: {isLoadingStudents ? '是' : '否'}</div>
            <div>Students Error: {studentsError?.message || '无'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};