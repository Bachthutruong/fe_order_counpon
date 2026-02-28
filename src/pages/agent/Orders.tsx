import { useEffect, useState } from 'react';
import api from '../../lib/api';
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
        <h1 className="text-2xl font-bold tracking-tight">Đơn Hàng & Hoa Hồng</h1>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Danh Sách Đơn Của Đại Lý</CardTitle>
          <CardDescription>Bao gồm những đơn hàng khách đã mua thông qua thẻ mã giảm giá của đại lý này.</CardDescription>
          <div className="flex w-full md:max-w-sm items-center space-x-2">
            <Input 
              type="text" 
              placeholder="Tìm kiếm khách/mã..." 
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
             <div className="text-center py-4 text-muted-foreground">Đang tải...</div>
          ) : (
            <>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã L/W</TableHead>
                  <TableHead>Khách Hàng</TableHead>
                  <TableHead className="text-right">Hoa hồng (Doanh Thu)</TableHead>
                  <TableHead>Mã Đã Dùng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order.wcOrderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-green-600">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
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
                      {new Date(order.dateCreated).toLocaleDateString('vi-VN')}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                      Hiện chưa có đơn hàng nào
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
