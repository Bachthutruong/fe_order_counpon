import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth() as any; // any to bypass strict type for now, checkAuth needs to be added to context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    try {
      await api.post('/auth/change-password', { oldPassword, newPassword });
      // Update local state or re-fetch me
      await checkAuth(); // Assuming we export checkAuth or update user state
      navigate(user?.role === 'ADMIN' ? '/admin' : '/agent');
    } catch (err: any) {
      setError(err.response?.data?.message || '變更密碼失敗');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 relative">
      <div className="absolute inset-0 z-0 bg-indigo-500/10 -skew-y-12 h-[50vh] blur-3xl transform"></div>
      <Card className="w-[450px] z-10 shadow-xl border-t-4 border-indigo-500 rounded-xl relative">
        {user?.isFirstLogin && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-medium shadow">
            請先變更密碼
          </div>
        )}
        <CardHeader className="text-center pt-8">
          <CardTitle className="text-2xl font-bold">變更密碼</CardTitle>
          <CardDescription>請變更密碼以繼續使用</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 text-sm text-red-500 bg-red-100/50 rounded-md border border-red-200">{error}</div>}
            <div className="space-y-2">
              <Label>目前密碼</Label>
              <Input 
                type="password" 
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label>新密碼</Label>
              <Input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="focus-visible:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label>再次輸入新密碼</Label>
              <Input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="focus-visible:ring-indigo-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30">
              變更密碼並繼續
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePassword;
