import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Pagination } from '../../components/ui/pagination-custom';
import { useToast } from '../../hooks/use-toast';

interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  agentId: { _id: string; name: string };
  active: boolean;
  createdAt: string;
}

interface Agent {
  _id: string;
  name: string;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: '', discountType: 'percent', discountValue: 0, agentId: '' });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [agentFilter, setAgentFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [{ data: cData }, { data: aData }] = await Promise.all([
        api.get('/admin/coupons', { params: { page, limit, search, agentId: agentFilter } }),
        api.get('/admin/agents', { params: { limit: 100 } })
      ]);
      setCoupons(cData.data);
      setTotal(cData.total);
      setAgents(aData.data);    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search, agentFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.agentId) {
         toast({ variant: 'destructive', title: '請填寫', description: '請選擇經銷商！' });
         return;
      }
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, formData);
        toast({ title: '成功', description: '折扣碼已更新！' });
      } else {
        await api.post('/admin/coupons', formData);
        toast({ title: '成功', description: '已建立折扣碼並同步至 WordPress！' });
      }
      setOpenDialog(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '操作失敗' });
    }
  };

  const syncToWc = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/wc/sync-coupons');
      toast({ title: '同步完成', description: data.message });
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '同步失敗', description: error.response?.data?.message || '系統錯誤' });
    } finally {
      setSyncing(false);
    }
  };

  const deleteCoupon = async (id: string) => {
    if (window.confirm('確定要刪除此折扣碼嗎（將同步自 WordPress 刪除）？')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchData();
        toast({ title: '成功', description: '折扣碼已刪除！' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '刪除失敗' });
      }
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ code: '', discountType: 'percent', discountValue: 0, agentId: '' });
    setOpenDialog(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setFormData({ 
      code: coupon.code, 
      discountType: coupon.discountType, 
      discountValue: coupon.discountValue,
      agentId: coupon.agentId?._id || ''
    });
    setOpenDialog(true);
  };

  if (loading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">折扣碼管理</h1>
        <div className="space-x-2">
            <Button variant="outline" onClick={syncToWc} disabled={syncing}>
                {syncing ? '同步中...' : '推送至 WordPress'}
            </Button>
            <Button onClick={openAdd}>新增折扣碼</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>折扣碼列表</CardTitle>
          <CardDescription>折扣碼與 WooCommerce 商店同步，並綁定經銷商</CardDescription>
          <div className="flex w-full md:max-w-lg items-center space-x-2">
            <Input 
              type="text" 
              placeholder="搜尋折扣碼..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
            <Select value={agentFilter} onValueChange={(val) => { setAgentFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="全部經銷商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部經銷商</SelectItem>
                {agents.map(ag => (
                    <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>代碼</TableHead>
                <TableHead>折扣類型</TableHead>
                <TableHead className="text-right">折扣額</TableHead>
                <TableHead>經銷商</TableHead>
                <TableHead>建立日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-bold">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType === 'percent' ? '依 %' : '固定金額 (NT$)'}</TableCell>
                  <TableCell className="text-right">
                    {coupon.discountType === 'percent' 
                      ? `${coupon.discountValue}%` 
                      : formatCurrency(coupon.discountValue)}
                  </TableCell>
                  <TableCell>{coupon.agentId ? coupon.agentId.name : 'N/A'}</TableCell>
                  <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>編輯</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCoupon(coupon._id)}>刪除</Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    尚無折扣碼
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <Pagination 
            page={page} 
            limit={limit} 
            total={total} 
            onPageChange={setPage} 
            onLimitChange={setLimit} 
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? '編輯折扣碼' : '新增折扣碼（管理員）'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">折扣碼</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                required 
                placeholder="例：SAVE2023" 
                disabled={!!editingId} // Code should not be editable usually
              />
            </div>

            <div className="space-y-2">
              <Label>折扣類型</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇折扣類型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">依比例 %</SelectItem>
                  <SelectItem value="fixed_cart">固定金額（購物車）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">折扣額 ({formData.discountType === 'percent' ? '%' : 'NT$'})</Label>
              <Input id="value" type="number" min={1} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} required />
            </div>

            <div className="space-y-2">
              <Label>指定經銷商</Label>
              <Select value={formData.agentId} onValueChange={(value) => setFormData({...formData, agentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇經銷商" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((ag) => (
                      <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>取消</Button>
              <Button type="submit">{editingId ? '儲存' : '建立並同步至 WordPress'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
