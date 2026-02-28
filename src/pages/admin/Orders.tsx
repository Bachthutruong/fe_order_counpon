import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Pagination } from '../../components/ui/pagination-custom';
import { useToast } from '../../hooks/use-toast';

interface Order {
  _id: string;
  wcOrderId: number;
  total: number;
  discountTotal: number;
  couponCodeUsed?: string;
  agentId?: { _id: string; name: string };
  status: string;
  dateCreated: string;
  customerName: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
     try {
       setLoading(true);
       const [{ data: oData }, { data: aData }] = await Promise.all([
         api.get('/admin/orders', { params: { page, limit, search, agentId: agentFilter } }),
         api.get('/admin/agents', { params: { limit: 100 } }),
       ]);
       setOrders(oData.data);
       setTotal(oData.total);
       setAgents(aData.data);
     } catch (error) {
       console.error(error);
     } finally {
       setLoading(false);
     }
  };

  useEffect(() => {
    fetchData();
  }, [agentFilter, page, limit, search]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post('/wc/sync-orders');
      toast({ title: 'Đồng bộ hoàn tất', description: `${data.imported} đơn hàng mới/được cập nhật` });
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Lỗi đồng bộ', description: error.response?.data?.message || 'Có lỗi khi đồng bộ WooCommerce' });
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Doanh Thu & Đơn Hàng</h1>
        <div className="flex gap-4 items-center">
            <Input 
              type="text" 
              placeholder="Tìm kiếm khách/mã..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-[200px]"
            />
            <Select value={agentFilter} onValueChange={(val) => { setAgentFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tất cả đại lý" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đại lý (bao gồm đơn ngoài)</SelectItem>
                {agents.map(ag => (
                    <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSync} disabled={syncing}>
                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ từ WordPress'}
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Giao Dịch</CardTitle>
          <CardDescription>Cập nhật số liệu tự động từ hệ thống WooCommerce bán hàng</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-4 text-muted-foreground">Đang tải...</div>
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã (WC)</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Mã Đại lý (được dùng)</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order.wcOrderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                      {order.discountTotal > 0 && <span className="text-xs text-red-500 block">(-{order.discountTotal})</span>}
                    </TableCell>
                    <TableCell>
                      {order.couponCodeUsed ? (
                          <div>
                              <span className="font-bold text-blue-600">{order.couponCodeUsed}</span>
                              <div className="text-xs text-muted-foreground">{order.agentId ? order.agentId.name : 'Unknown'}</div>
                          </div>
                      ) : (
                          <span className="text-muted-foreground text-sm italic">Không dùng mã</span>
                      )}
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} uppercase`}>
                        {order.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(order.dateCreated).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      Chưa có giao dịch cho chi nhánh này
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
            </>
          )}
          
        </CardContent>
      </Card>

    </div>
  );
};

export default Orders;
