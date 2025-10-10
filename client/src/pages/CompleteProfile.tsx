import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhoneInput } from '@/components/ui/phone-input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    student_id: '',
    chinese_name: '',
    english_name: '',
    gender: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    status: 'active',
    state: '',
    postcode: '',
    year_of_birth: new Date().getFullYear() - 25,
    personal_contact_number: '',
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',
    profession: '',
    education_level: '',
    maritial_status: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }

      if (session.user.user_metadata?.student_id) {
        navigate('/dashboard');
        return;
      }

      setUserEmail(session.user.email || '');
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Step 1: Getting session...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('未登录');
      }
      console.log('Step 1: Session obtained', session.user.email);

      console.log('Step 2: Checking for existing student...');
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('student_id')
        .eq('student_id', formData.student_id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Check error:', checkError);
        throw checkError;
      }

      if (existingStudent) {
        console.log('Student ID already exists');
        toast({
          title: '学员编号已存在',
          description: '请使用不同的学员编号',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      console.log('Step 2: No existing student found');

      console.log('Step 3: Inserting student record...');
      const { error: insertError } = await supabase
        .from('students')
        .insert({
          student_id: formData.student_id,
          chinese_name: formData.chinese_name,
          english_name: formData.english_name,
          gender: formData.gender,
          date_of_joining: formData.date_of_joining,
          status: formData.status,
          email: userEmail,
          state: formData.state,
          postcode: formData.postcode,
          year_of_birth: formData.year_of_birth,
          personal_contact_number: formData.personal_contact_number,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_number: formData.emergency_contact_number,
          emergency_contact_relationship: formData.emergency_contact_relationship,
          profession: formData.profession,
          education_level: formData.education_level,
          maritial_status: formData.maritial_status,
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      console.log('Step 3: Student record inserted successfully');

      console.log('Step 4: Updating user metadata...');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          student_id: formData.student_id,
          chinese_name: formData.chinese_name,
          english_name: formData.english_name,
        },
      });

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      console.log('Step 4: User metadata updated successfully');

      toast({
        title: '资料完成',
        description: '您的学员资料已创建成功',
      });

      console.log('Step 5: Navigating to dashboard...');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast({
        title: '提交失败',
        description: error.message || '无法保存您的资料，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      console.log('Finally: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">完善学员资料 / Complete Your Profile</CardTitle>
          <CardDescription>
            请填写您的学员信息以完成注册
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">学员编号 / Student ID *</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="例如: STU2024001"
                  required
                  data-testid="input-student-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">电子邮箱 / Email</Label>
                <Input
                  id="email"
                  value={userEmail}
                  disabled
                  className="bg-gray-50"
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chinese_name">中文姓名 / Chinese Name *</Label>
                <Input
                  id="chinese_name"
                  value={formData.chinese_name}
                  onChange={(e) => handleChange('chinese_name', e.target.value)}
                  placeholder="张三"
                  required
                  data-testid="input-chinese-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="english_name">英文姓名 / English Name</Label>
                <Input
                  id="english_name"
                  value={formData.english_name}
                  onChange={(e) => handleChange('english_name', e.target.value)}
                  placeholder="Zhang San"
                  data-testid="input-english-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">性别 / Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleChange('gender', value)}
                >
                  <SelectTrigger id="gender" data-testid="select-gender">
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="男">男 / Male</SelectItem>
                    <SelectItem value="女">女 / Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_of_birth">出生年份 / Year of Birth</Label>
                <Input
                  id="year_of_birth"
                  type="number"
                  value={formData.year_of_birth}
                  onChange={(e) => handleChange('year_of_birth', parseInt(e.target.value))}
                  min="1900"
                  max={new Date().getFullYear()}
                  data-testid="input-year-of-birth"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">州属 / State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleChange('state', value)}
                >
                  <SelectTrigger id="state" data-testid="select-state">
                    <SelectValue placeholder="选择州属" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="玻璃市">玻璃市</SelectItem>
                    <SelectItem value="吉打">吉打</SelectItem>
                    <SelectItem value="槟城">槟城</SelectItem>
                    <SelectItem value="霹雳">霹雳</SelectItem>
                    <SelectItem value="雪隆">雪隆</SelectItem>
                    <SelectItem value="森美兰">森美兰</SelectItem>
                    <SelectItem value="马六甲">马六甲</SelectItem>
                    <SelectItem value="柔佛">柔佛</SelectItem>
                    <SelectItem value="彭亨">彭亨</SelectItem>
                    <SelectItem value="登嘉楼">登嘉楼</SelectItem>
                    <SelectItem value="吉兰丹">吉兰丹</SelectItem>
                    <SelectItem value="沙巴">沙巴</SelectItem>
                    <SelectItem value="砂拉越">砂拉越</SelectItem>
                    <SelectItem value="纳闽">纳闽</SelectItem>
                    <SelectItem value="东马">东马</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">邮编 / Postcode</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleChange('postcode', e.target.value)}
                  placeholder="例如: 50000"
                  data-testid="input-postcode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personal_contact_number">个人联系电话 / Personal Contact Number</Label>
                <PhoneInput
                  defaultCountry="MY"
                  value={formData.personal_contact_number}
                  onChange={(value: string) => handleChange('personal_contact_number', value || '')}
                  placeholder="Enter phone number"
                  data-testid="input-personal-contact-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">职业 / Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleChange('profession', e.target.value)}
                  placeholder="例如: 工程师"
                  data-testid="input-profession"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education_level">教育程度 / Education Level</Label>
                <Select
                  value={formData.education_level}
                  onValueChange={(value) => handleChange('education_level', value)}
                >
                  <SelectTrigger id="education_level" data-testid="select-education-level">
                    <SelectValue placeholder="选择教育程度" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="小学">小学 / Primary</SelectItem>
                    <SelectItem value="中学">中学 / Secondary</SelectItem>
                    <SelectItem value="大专">大专 / Diploma</SelectItem>
                    <SelectItem value="本科">本科 / Bachelor</SelectItem>
                    <SelectItem value="硕士">硕士 / Master</SelectItem>
                    <SelectItem value="博士">博士 / PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maritial_status">婚姻状况 / Marital Status</Label>
                <Select
                  value={formData.maritial_status}
                  onValueChange={(value) => handleChange('maritial_status', value)}
                >
                  <SelectTrigger id="maritial_status" data-testid="select-marital-status">
                    <SelectValue placeholder="选择婚姻状况" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="未婚">未婚 / Single</SelectItem>
                    <SelectItem value="已婚">已婚 / Married</SelectItem>
                    <SelectItem value="离婚">离婚 / Divorced</SelectItem>
                    <SelectItem value="丧偶">丧偶 / Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">紧急联系人 / Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                  placeholder="例如: 李四"
                  data-testid="input-emergency-contact-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_number">紧急联系电话 / Emergency Contact Number</Label>
                <PhoneInput
                  defaultCountry="MY"
                  value={formData.emergency_contact_number}
                  onChange={(value: string) => handleChange('emergency_contact_number', value || '')}
                  placeholder="Enter phone number"
                  data-testid="input-emergency-contact-number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relationship">紧急联系人关系 / Emergency Contact Relationship</Label>
                <Select
                  value={formData.emergency_contact_relationship}
                  onValueChange={(value) => handleChange('emergency_contact_relationship', value)}
                >
                  <SelectTrigger id="emergency_contact_relationship" data-testid="select-emergency-contact-relationship">
                    <SelectValue placeholder="选择关系" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parent">父母 / Parent</SelectItem>
                    <SelectItem value="Spouse">配偶 / Spouse</SelectItem>
                    <SelectItem value="Sibling">兄弟姐妹 / Sibling</SelectItem>
                    <SelectItem value="Child">子女 / Child</SelectItem>
                    <SelectItem value="Friend">朋友 / Friend</SelectItem>
                    <SelectItem value="Other">其他 / Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-submit-profile"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  提交中...
                </>
              ) : (
                '提交资料 / Submit Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
