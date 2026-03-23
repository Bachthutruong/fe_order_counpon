import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Pagination } from '../../components/ui/pagination-custom';
import { useToast } from '../../hooks/use-toast';

interface Admin {
  _id: string;
  name: string;
  phone: string;
  active: boolean;
}

const Admins = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', active: true });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get('/admin/admins', {
        params: { page, limit, search }
      });
      setAdmins(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, limit, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await api.put(`/admin/admins/${editingAdmin._id}`, {
          name: formData.name,
          phone: formData.phone,
          active: formData.active
        });
      } else {
        await api.post('/admin/admins', {
          name: formData.name,
          phone: formData.phone,
          password: formData.password
        });
      }

      setOpenDialog(false);
      fetchAdmins();
      toast({ title: '成功', description: editingAdmin ? '已更新管理員！' : '已新增管理員！' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '儲存失敗' });
    }
  };

  const removeAdmin = async (id: string) => {
    if (window.confirm('確定要刪除此管理員帳號嗎？')) {
      try {
        await api.delete(`/admin/admins/${id}`);
        fetchAdmins();
        toast({ title: '成功', description: '已刪除管理員！' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '刪除失敗' });
      }
    }
  };

  const openAdd = () => {
    setEditingAdmin(null);
    setFormData({ name: '', phone: '', password: '', active: true });
    setOpenDialog(true);
  };

  const openEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({ name: admin.name, phone: admin.phone, password: '', active: admin.active });
    setOpenDialog(true);
  };

  if (loading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">管理員帳號管理</h1>
        <Button onClick={openAdd}>新增管理員</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>管理員列表</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              placeholder="依姓名或電話搜尋..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>姓名</TableHead>
                <TableHead>電話號碼</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {admin.active ? '啟用' : '已停用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(admin)}>編輯</Button>
                    <Button variant="destructive" size="sm" onClick={() => removeAdmin(admin._id)}>刪除</Button>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    尚無管理員資料
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
            <DialogTitle>{editingAdmin ? '更新管理員' : '新增管理員'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">管理員名稱</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">帳號 / 電話號碼</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
            </div>
            {!editingAdmin && (
              <div className="space-y-2">
                <Label htmlFor="password">初始密碼</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            )}
            {editingAdmin && (
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="active" className="font-normal cursor-pointer">允許啟用</Label>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>取消</Button>
              <Button type="submit">儲存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admins;
