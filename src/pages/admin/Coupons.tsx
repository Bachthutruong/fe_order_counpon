import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
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
         toast({ variant: 'destructive', title: 'Thiếu thông tin', description: 'Vui lòng chọn đại lý!' });
         return;
      }
      if (editingId) {
        await api.put(`/admin/coupons/${editingId}`, formData);
        toast({ title: 'Thành công', description: 'Cập nhật mã giảm giá thành công!' });
      } else {
        await api.post('/admin/coupons', formData);
        toast({ title: 'Thành công', description: 'Tạo mã giảm giá và đồng bộ thành công!' });
      }
      setOpenDialog(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.message || 'Lỗi thao tác' });
    }
  };

  const deleteCoupon = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn xoá mã giảm giá này (Đồng bộ xoá từ WordPress)?')) {
      try {
        await api.delete(`/admin/coupons/${id}`);
        fetchData();
        toast({ title: 'Thành công', description: 'Xoá mã giảm giá thành công!' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.message || 'Xoá thất bại' });
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

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Mã Quản Lý Giảm Giá</h1>
        <Button onClick={openAdd}>Tạo mới Mã KH</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Danh sách Mã Giảm Giá</CardTitle>
          <CardDescription>Mã được đồng bộ với cửa hàng WooCommerce và gắn mã định danh đại lý</CardDescription>
          <div className="flex w-full md:max-w-lg items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Tìm kiếm mã code..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="flex-1"
            />
            <Select value={agentFilter} onValueChange={(val) => { setAgentFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả đại lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đại lý</SelectItem>
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
                <TableHead>Mã (Code)</TableHead>
                <TableHead>Loại Giảm</TableHead>
                <TableHead className="text-right">Mức Giảm</TableHead>
                <TableHead>Đại Lý</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-bold">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType === 'percent' ? 'Giảm theo %' : 'Giảm tiền (VNĐ)'}</TableCell>
                  <TableCell className="text-right">
                    {coupon.discountType === 'percent' 
                      ? `${coupon.discountValue}%` 
                      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discountValue)}
                  </TableCell>
                  <TableCell>{coupon.agentId ? coupon.agentId.name : 'N/A'}</TableCell>
                  <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCoupon(coupon._id)}>Xoá</Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    Chưa có mã giảm giá nào
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
            <DialogTitle>{editingId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới (Cấp Admin)'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã code</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                required 
                placeholder="Ví dụ: SAVE2023" 
                disabled={!!editingId} // Code should not be editable usually
              />
            </div>

            <div className="space-y-2">
              <Label>Loại giảm giá</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Giảm theo tỷ lệ %</SelectItem>
                  <SelectItem value="fixed_cart">Giảm tiền mặt (cho giỏ hàng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Mức giảm ({formData.discountType === 'percent' ? '%' : 'VNĐ'})</Label>
              <Input id="value" type="number" min={1} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} required />
            </div>

            <div className="space-y-2">
              <Label>Cho Đại lý</Label>
              <Select value={formData.agentId} onValueChange={(value) => setFormData({...formData, agentId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đại lý gán mã" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((ag) => (
                      <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Huỷ</Button>
              <Button type="submit">{editingId ? 'Lưu thay đổi' : 'Tạo & Đồng bộ WordPress'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Coupons;
