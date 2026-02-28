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
        toast({ title: 'Thành công', description: 'Cập nhật mã giảm giá thành công!' });
      } else {
        await api.post('/agent/coupons', formData);
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
    if (window.confirm('Bạn có chắc chắn xoá mã giảm giá này?')) {
      try {
        await api.delete(`/agent/coupons/${id}`);
        fetchData();
        toast({ title: 'Thành công', description: 'Xoá mã giảm giá thành công!' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.message || 'Xoá thất bại' });
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

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Mã Giảm Giá Của Tôi</h1>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">Tạo mã mới</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Danh Sách Mã Giảm Giá</CardTitle>
          <CardDescription>Các mã này được đồng bộ trực tiếp lên hệ thống bán hàng và tự động theo dõi doanh thu.</CardDescription>
          <div className="flex w-full md:max-w-sm items-center space-x-2">
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
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã (Code)</TableHead>
                <TableHead>Loại Giảm</TableHead>
                <TableHead className="text-right">Mức Giảm</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon._id}>
                  <TableCell className="font-bold text-indigo-600 uppercase">{coupon.code}</TableCell>
                  <TableCell>{coupon.discountType === 'percent' ? 'Tỉ lệ %' : 'Số tiền cố định'}</TableCell>
                  <TableCell className="text-right">
                    {coupon.discountType === 'percent' 
                      ? `${coupon.discountValue}%` 
                      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.discountValue)}
                  </TableCell>
                  <TableCell>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-medium">Hoạt động</span>
                  </TableCell>
                  <TableCell>{new Date(coupon.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(coupon)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCoupon(coupon._id)}>Xoá</Button>
                  </TableCell>
                </TableRow>
              ))}
              {coupons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
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
            <DialogTitle>{editingId ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo Mã Khuyến Mãi'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="code">Nhập Mã Code</Label>
              <Input 
                id="code" 
                value={formData.code} 
                onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                required 
                placeholder="Ví dụ: DAI-LY-HANOI-123" 
                disabled={!!editingId}
              />
            </div>

            <div className="space-y-2">
              <Label>Loại Khuyến Mãi</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({...formData, discountType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại giảm giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Giảm theo tỷ lệ %</SelectItem>
                  <SelectItem value="fixed_cart">Giảm tiền mặt (đơn hàng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Mức giảm ({formData.discountType === 'percent' ? '%' : 'VNĐ'})</Label>
              <Input id="value" type="number" min={1} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} required />
              <p className="text-xs text-muted-foreground">Tuân thủ giới hạn thiết lập bởi Admin để được duyệt.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Huỷ bỏ</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentCoupons;
