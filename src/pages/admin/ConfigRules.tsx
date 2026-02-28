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
    applyRules: true
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
      toast({ title: 'Thành công', description: 'Đã cập nhật cấu hình thành công!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.message || 'Lỗi cập nhật cấu hình' });
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Cấu hình Quy tắc Mã giảm giá</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Quy tắc tạo mã cho Đại lý</CardTitle>
          <CardDescription>Cài đặt giới hạn tối thiểu và tối đa khi đại lý tạo mã giảm giá</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-0.5">
                <Label className="text-base">Kích hoạt quy tắc</Label>
                <CardDescription>Nếu tắt, đại lý có thể tạo mã với giá trị bất kỳ</CardDescription>
              </div>
              <Switch 
                checked={config.applyRules}
                onCheckedChange={(checked) => setConfig({ ...config, applyRules: checked })}
              />
            </div>

            <Separator />

            <div className={`grid grid-cols-2 gap-4 transition-opacity ${!config.applyRules ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-2">
                <Label htmlFor="minPercent">% Giảm Tối thiểu</Label>
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
                <Label htmlFor="maxPercent">% Giảm Tối đa</Label>
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
                <Label htmlFor="minFixed">Số tiền Giảm Tối thiểu</Label>
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
                    <span className="text-gray-500 sm:text-sm">VNĐ</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxFixed">Số tiền Giảm Tối đa</Label>
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
                    <span className="text-gray-500 sm:text-sm">VNĐ</span>
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full">
              Lưu Cấu hình
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigRules;
