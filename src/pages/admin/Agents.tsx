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

interface Agent {
  _id: string;
  name: string;
  phone: string;
  active: boolean;
}

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '', active: true });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchAgents = async () => {
    try {
      const { data } = await api.get('/admin/agents', {
        params: { page, limit, search }
      });
      setAgents(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [page, limit, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await api.put(`/admin/agents/${editingAgent._id}`, formData);
      } else {
        await api.post('/admin/agents', formData);
      }
      setOpenDialog(false);
      fetchAgents();
      toast({ title: 'Thành công', description: 'Cập nhật đại lý thành công!' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi', description: error.response?.data?.message || 'Lỗi lưu dữ liệu' });
    }
  };

  const deleteAgent = async (id: string) => {
    if (window.confirm('Bạn có chắc xoá đại lý này? Các dữ liệu liên quan có thể bị ảnh hưởng!')) {
      try {
        await api.delete(`/admin/agents/${id}`);
        fetchAgents();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openAdd = () => {
    setEditingAgent(null);
    setFormData({ name: '', phone: '', active: true });
    setOpenDialog(true);
  };

  const openEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setFormData({ name: agent.name, phone: agent.phone, active: agent.active });
    setOpenDialog(true);
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Đại lý</h1>
        <Button onClick={openAdd}>Thêm Đại lý mới</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Danh sách đại lý</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Tìm kiếm theo tên hoặc SĐT..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agent.active ? 'Hoạt động' : 'Đã khoá'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(agent)}>Sửa</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteAgent(agent._id)}>Xoá</Button>
                  </TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    Không có đại lý nào
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
            <DialogTitle>{editingAgent ? 'Сập nhật Đại lý' : 'Thêm Đại lý'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên Đại lý</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              {!editingAgent && <p className="text-xs text-muted-foreground mt-1">Mật khẩu mặc định: 123456789</p>}
            </div>
            {editingAgent && (
              <div className="flex items-center space-x-2 mt-4">
                <input 
                  type="checkbox" 
                  id="active" 
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="active" className="font-normal cursor-pointer">Cho phép hoạt động</Label>
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>Huỷ</Button>
              <Button type="submit">Lưu lại</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Agents;
