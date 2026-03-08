import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';

const ConfigRules = () => {
  const [config, setConfig] = useState({
    minDiscountPercent: 0,
    maxDiscountPercent: 100,
    minDiscountFixed: 0,
    maxDiscountFixed: 999999999,
    applyRules: true,
    defaultAgentPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/admin/config');
      setConfig(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/config', config);
      toast({ title: '成功', description: '設定已更新！' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '設定更新失敗' });
    }
  };

  if (loading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">折扣碼規則設定</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>經銷商建立折扣碼規則</CardTitle>
          <CardDescription>設定經銷商建立折扣碼時的最低與最高限額</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">啟用規則</Label>
                <CardDescription>若關閉，經銷商可建立任意金額的折扣碼</CardDescription>
              </div>
              <Switch 
                checked={config.applyRules}
                onCheckedChange={(checked) => setConfig({ ...config, applyRules: checked })}
              />
            </div>

            <Separator />

            <div className={`grid grid-cols-2 gap-4 transition-opacity ${!config.applyRules ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="minPercent">最低折扣 %</Label>
                <div className="relative">
                  <Input 
                    id="minPercent" 
                    type="number" 
                    value={config.minDiscountPercent} 
                    onChange={e => setConfig({ ...config, minDiscountPercent: Number(e.target.value) })}
                    min={0} max={100} required={config.applyRules}
                    disabled={!config.applyRules}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxPercent">最高折扣 %</Label>
                 <div className="relative">
                  <Input 
                    id="maxPercent" 
                    type="number" 
                    value={config.maxDiscountPercent} 
                    onChange={e => setConfig({ ...config, maxDiscountPercent: Number(e.target.value) })}
                    min={0} max={100} required={config.applyRules}
                    disabled={!config.applyRules}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-2 gap-4 transition-opacity ${!config.applyRules ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="minFixed">最低折扣金額</Label>
                <div className="relative">
                  <Input 
                    id="minFixed" 
                    type="number" 
                    value={config.minDiscountFixed} 
                    onChange={e => setConfig({ ...config, minDiscountFixed: Number(e.target.value) })}
                    min={0} required={config.applyRules}
                    disabled={!config.applyRules}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">NT$</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFixed">最高折扣金額</Label>
                <div className="relative">
                  <Input 
                    id="maxFixed" 
                    type="number" 
                    value={config.maxDiscountFixed} 
                    onChange={e => setConfig({ ...config, maxDiscountFixed: Number(e.target.value) })}
                    min={0} required={config.applyRules}
                    disabled={!config.applyRules}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-gray-500 sm:text-sm">NT$</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="defaultAgentPassword">新經銷商預設密碼</Label>
              <Input
                id="defaultAgentPassword"
                type="text"
                value={config.defaultAgentPassword ?? ''}
                onChange={e => setConfig({ ...config, defaultAgentPassword: e.target.value })}
                placeholder="留空則為 123456789"
              />
              <CardDescription>管理員新增經銷商時，該經銷商首次登入將使用此密碼（建議登入後變更）。</CardDescription>
            </div>

            <Button type="submit" className="w-full">
              儲存設定
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigRules;
