import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { phone, password });
      login(data);
      if (data.isFirstLogin) {
        navigate('/change-password');
      } else {
        navigate(data.role === 'ADMIN' ? '/admin' : '/agent');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '登入失敗');
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 relative">
      <div className="absolute inset-0 z-0 bg-blue-500/10 skew-y-12 h-[50vh] blur-3xl transform"></div>
      <Card className="w-[400px] z-10 shadow-xl border-t-4 border-blue-500 rounded-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-slate-800">Jiudi 系統</CardTitle>
          <CardDescription>登入管理後台</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100/50 rounded-md border border-red-200">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="phone">電話號碼</Label>
              <Input 
                id="phone" 
                type="text" 
                placeholder="請輸入電話號碼..." 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30">
              登入
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
