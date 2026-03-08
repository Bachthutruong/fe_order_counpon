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
      toast({ title: '成功', description: '已更新經銷商！' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: '錯誤', description: error.response?.data?.message || '儲存失敗' });
    }
  };

  const deleteAgent = async (id: string) => {
    if (window.confirm('確定要刪除此經銷商嗎？相關資料可能受影響！')) {
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

  if (loading) return <div>載入中...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">經銷商管理</h1>
        <Button onClick={openAdd}>新增經銷商</Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>經銷商列表</CardTitle>
          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="依姓名或電話搜尋..." 
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
                <TableHead>姓名</TableHead>
                <TableHead>電話號碼</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent._id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>{agent.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${agent.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {agent.active ? '啟用' : '已停用'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(agent)}>編輯</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteAgent(agent._id)}>刪除</Button>
                  </TableCell>
                </TableRow>
              ))}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    尚無經銷商
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
            <DialogTitle>{editingAgent ? '更新經銷商' : '新增經銷商'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">經銷商名稱</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">電話號碼</Label>
              <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              {!editingAgent && <p className="text-xs text-muted-foreground mt-1">預設密碼：123456789</p>}
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

export default Agents;
