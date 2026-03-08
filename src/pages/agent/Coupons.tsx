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
  active: boolean;
  createdAt: string;
}

const AgentCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ code: '', discountType: 'percent', discountValue: 0 });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const { data } = await api.get('/agent/coupons', { params: { page, limit, search } });
      setCoupons(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/agent/coupons/${editingId}`, formData);
        toast({ title: '成功', description: '折扣碼已更新！' });
      } else {
        await api.post('/agent/coupons', formData);
        toast({ title: '成功', description: '已建立折扣碼並同步！' });
      }
      setOpenDialog(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '操作失敗' });
    }
  };

  const deleteCoupon = async (id: string) => {
    if (window.confirm('確定要刪除此折扣碼嗎？')) {
      try {
        await api.delete(`/agent/coupons/${id}`);
        fetchData();
        toast({ title: '成功', description: '折扣碼已刪除！' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '刪除失敗' });
      }
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({ code: '', discountType: 'percent', discountValue: 0 });
    setOpenDialog(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon._id);
    setFormData({ 
      code: coupon.code, 
      discountType: coupon.discountType, 
      discountValue: coupon.discountValue 
    });
    setOpenDialog(true);
  };

  if (loading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">我的折扣碼</h1>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">新增折扣碼</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>折扣碼列表</CardTitle>
          <CardDescription>折扣碼會同步至銷售系統並自動追蹤營收</CardDescription>
          <div className="flex w-full md:max-w-sm items-center space-x-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>代碼</TableHead>
                <TableHead>折扣類型</TableHead>
                <TableHead className="text-right">折扣額</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>建立日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-bold text-indigo-600 uppercase">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType === 'percent' ? '比例 %' : '固定金額'}</TableCell>
                  <TableCell className="text-right">
                    {coupon.discountType === 'percent' 
                      ? `${coupon.discountValue}%` 
                      : formatCurrency(coupon.discountValue)}
                  </TableCell>
                  <TableCell>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">啟用</span>
                  </TableCell>
                  <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>編輯</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCoupon(coupon._id)}>刪除</Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
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
            <DialogTitle>{editingId ? '編輯折扣碼' : '新增折扣碼'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">輸入折扣碼</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                required 
                placeholder="例：DEALER-TPE-001" 
                disabled={!!editingId}
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
                  <SelectItem value="fixed_cart">固定金額（訂單）</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">折扣額 ({formData.discountType === 'percent' ? '%' : 'NT$'})</Label>
              <Input id="value" type="number" min={1} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} required />
              <p className="text-xs text-muted-foreground">須符合管理員設定之限額方可通過。</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>取消</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingId ? '儲存' : '新增'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentCoupons;
