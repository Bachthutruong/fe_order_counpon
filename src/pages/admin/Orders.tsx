import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
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

interface WcOrderDetail {
  id: number;
  status: string;
  total: string;
  discount_total: string;
  billing?: { first_name?: string; last_name?: string; address_1?: string; city?: string; state?: string; postcode?: string; country?: string; email?: string; phone?: string };
  line_items?: { name: string; quantity: number; total: string }[];
  date_created: string;
  coupon_lines?: { code: string }[];
  agentId?: { name: string };
  couponCodeUsed?: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<WcOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editWcOrderId, setEditWcOrderId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ status: string; billing: Record<string, string> }>({ status: '', billing: {} });
  const [editSaving, setEditSaving] = useState(false);

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
      toast({ title: '同步完成', description: `${data.imported} 筆訂單已更新` });
      fetchData();
    } catch (error: any) {
      toast({ variant: 'destructive', title: '同步失敗', description: error.response?.data?.message || 'WooCommerce 同步時發生錯誤' });
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

  const openDetail = async (order: Order) => {
    setDetailOpen(true);
    setDetailOrder(null);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/wc/orders/${order.wcOrderId}`);
      setDetailOrder(data);
    } catch (e: any) {
      toast({ variant: 'destructive', title: '錯誤', description: e.response?.data?.message || '無法載入訂單詳情' });
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = async (order: Order) => {
    setEditWcOrderId(order.wcOrderId);
    setEditOpen(true);
    setEditForm({ status: order.status, billing: {} });
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/wc/orders/${order.wcOrderId}`);
      setEditForm({
        status: data.status || order.status,
        billing: {
          first_name: data.billing?.first_name ?? '',
          last_name: data.billing?.last_name ?? '',
          email: data.billing?.email ?? '',
          phone: data.billing?.phone ?? '',
          address_1: data.billing?.address_1 ?? '',
          city: data.billing?.city ?? '',
          state: data.billing?.state ?? '',
          postcode: data.billing?.postcode ?? '',
          country: data.billing?.country ?? '',
        }
      });
    } catch (e: any) {
      toast({ variant: 'destructive', title: '錯誤', description: e.response?.data?.message || '無法載入訂單' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editWcOrderId == null) return;
    setEditSaving(true);
    try {
      await api.put(`/wc/orders/${editWcOrderId}`, { status: editForm.status, billing: editForm.billing });
      toast({ title: '已更新', description: '訂單已更新並同步至 WordPress。' });
      setEditOpen(false);
      await fetchData();
    } catch (e: any) {
      toast({ variant: 'destructive', title: '錯誤', description: e.response?.data?.message || '更新失敗' });
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">營收與訂單</h1>
        <div className="flex gap-4 items-center">
            <Input 
              type="text" 
              placeholder="搜尋客戶／折扣碼..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-[200px]"
            />
            <Select value={agentFilter} onValueChange={(val) => { setAgentFilter(val); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="全部經銷商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部經銷商（含未指定）</SelectItem>
                {agents.map(ag => (
                    <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSync} disabled={syncing}>
                {syncing ? '同步中...' : '自 WordPress 同步'}
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>交易紀錄</CardTitle>
          <CardDescription>資料由 WooCommerce 銷售系統自動更新</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-4 text-muted-foreground">載入中...</div>
          ) : (
            <>
              <Table>
              <TableHeader>
              <TableRow>
                <TableHead>訂單編號 (WC)</TableHead>
                <TableHead>客戶</TableHead>
                <TableHead>金額</TableHead>
                <TableHead>使用之經銷商碼</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead className="text-right">日期</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">#{order.wcOrderId}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {formatCurrency(order.total)}
                      {order.discountTotal > 0 && <span className="text-xs text-red-500 block">(-{formatCurrency(order.discountTotal)})</span>}
                    </TableCell>
                    <TableCell>
                      {order.couponCodeUsed ? (
                          <div>
                              <span className="font-bold text-blue-600">{order.couponCodeUsed}</span>
                              <div className="text-xs text-muted-foreground">{order.agentId ? order.agentId.name : '未知'}</div>
                          </div>
                      ) : (
                          <span className="text-muted-foreground text-sm italic">未使用折扣碼</span>
                      )}
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} uppercase`}>
                        {order.status}
                        </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(order.dateCreated).toLocaleDateString('zh-TW')}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openDetail(order)}>檢視詳情</Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(order)}>編輯</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                      尚無交易紀錄
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>訂單詳情</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">載入中...</div>
          ) : detailOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">訂單編號 (WC)：</span>
                <span className="font-medium">#{detailOrder.id}</span>
                <span className="text-muted-foreground">狀態：</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(detailOrder.status)}`}>{detailOrder.status}</span>
                <span className="text-muted-foreground">建立日期：</span>
                <span>{new Date(detailOrder.date_created).toLocaleString('zh-TW')}</span>
                <span className="text-muted-foreground">總金額：</span>
                <span>{formatCurrency(parseFloat(detailOrder.total))}</span>
                {detailOrder.couponCodeUsed && (
                  <>
                    <span className="text-muted-foreground">折扣碼：</span>
                    <span>{detailOrder.couponCodeUsed} {detailOrder.agentId && `(${detailOrder.agentId.name})`}</span>
                  </>
                )}
              </div>
              {detailOrder.billing && (
                <div>
                  <h4 className="font-medium mb-2">帳單資訊</h4>
                  <p className="text-sm text-muted-foreground">
                    {[detailOrder.billing.first_name, detailOrder.billing.last_name].filter(Boolean).join(' ')}<br />
                    {detailOrder.billing.email}<br />
                    {detailOrder.billing.phone}<br />
                    {[detailOrder.billing.address_1, detailOrder.billing.city, detailOrder.billing.state, detailOrder.billing.postcode, detailOrder.billing.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}
              {detailOrder.line_items && detailOrder.line_items.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">商品</h4>
                  <ul className="text-sm space-y-1">
                    {detailOrder.line_items.map((item, i) => (
                      <li key={i}>{item.name} × {item.quantity} — {formatCurrency(parseFloat(item.total))}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>編輯訂單 #{editWcOrderId}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">載入中...</div>
          ) : (
            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="space-y-2">
                <Label>狀態</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>名</Label>
                  <Input value={editForm.billing.first_name ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, first_name: e.target.value } })} placeholder="名" />
                </div>
                <div className="space-y-1">
                  <Label>姓</Label>
                  <Input value={editForm.billing.last_name ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, last_name: e.target.value } })} placeholder="姓" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" value={editForm.billing.email ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, email: e.target.value } })} placeholder="Email" />
              </div>
              <div className="space-y-1">
                <Label>電話</Label>
                <Input value={editForm.billing.phone ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, phone: e.target.value } })} placeholder="電話" />
              </div>
              <div className="space-y-1">
                <Label>地址</Label>
                <Input value={editForm.billing.address_1 ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, address_1: e.target.value } })} placeholder="地址" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>城市</Label>
                  <Input value={editForm.billing.city ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, city: e.target.value } })} placeholder="城市" />
                </div>
                <div className="space-y-1">
                  <Label>郵遞區號</Label>
                  <Input value={editForm.billing.postcode ?? ''} onChange={e => setEditForm({ ...editForm, billing: { ...editForm.billing, postcode: e.target.value } })} placeholder="郵遞區號" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>取消</Button>
                <Button type="submit" disabled={editSaving}>{editSaving ? '儲存中...' : '更新並同步'}</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Orders;
