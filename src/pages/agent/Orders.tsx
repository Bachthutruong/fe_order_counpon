import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Pagination } from '../../components/ui/pagination-custom';

interface Order {
  _id: string;
  wcOrderId: number;
  total: number;
  discountTotal: number;
  couponCodeUsed?: string;
  status: string;
  dateCreated: string;
  customerName: string;
}

const AgentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
     try {
       setLoading(true);
       const { data } = await api.get('/agent/orders', { params: { page, limit, search } });
       setOrders(data.data);
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
        <h1 className="text-2xl font-bold tracking-tight">訂單與佣金</h1>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>本經銷商訂單列表</CardTitle>
          <CardDescription>客戶透過您的折扣碼所下之訂單</CardDescription>
          <div className="flex w-full md:max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="搜尋客戶／折扣碼..." 
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
          {loading ? (
             <div className="text-center py-4 text-muted-foreground">載入中...</div>
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單編號</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead className="text-right">佣金（營收）</TableHead>
                  <TableHead>使用之折扣碼</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order.wcOrderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-green-600">
                          {formatCurrency(order.total)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-indigo-600">{order.couponCodeUsed || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} uppercase`}>
                        {order.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(order.dateCreated).toLocaleDateString('zh-TW')}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      尚無訂單
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

export default AgentOrders;
