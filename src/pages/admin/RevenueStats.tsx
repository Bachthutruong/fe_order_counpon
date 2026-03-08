import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend } from 'recharts';

interface RevenueByAgent {
  agentId: string | null;
  agentName: string;
  agentPhone?: string;
  totalRevenue: number;
  totalOrders: number;
  discountGiven: number;
}

const RevenueStats = () => {
  const [data, setData] = useState<RevenueByAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (agentFilter && agentFilter !== 'all') params.agentId = agentFilter;
      const { data: res } = await api.get('/admin/stats/revenue-by-agent', { params });
      setData(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const { data: aData } = await api.get('/admin/agents', { params: { limit: 100 } });
        setAgents(aData.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadAgents();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const chartData = data.map((row) => ({
    name: row.agentName || '未指定經銷商',
    revenue: row.totalRevenue,
    orders: row.totalOrders,
    discount: row.discountGiven,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">依經銷商營收統計</h1>

      <Card>
        <CardHeader>
          <CardTitle>篩選</CardTitle>
          <CardDescription>可依時間區間及／或經銷商篩選。時間留空＝全部；選擇經銷商＝僅顯示該經銷商。</CardDescription>
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4 pt-2">
            <div className="space-y-2">
              <Label>開始日期</Label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>結束日期</Label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>經銷商</Label>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="全部經銷商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部經銷商</SelectItem>
                  {agents.map((ag) => (
                    <SelectItem key={ag._id} value={ag._id}>{ag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">套用</Button>
          </form>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">載入中...</div>
      ) : chartData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            所選時間／經銷商尚無資料
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>依經銷商營收</CardTitle>
              <CardDescription>所選時間內各經銷商總營收 (NT$)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis type="category" dataKey="name" width={140} fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''} />
                    <Legend />
                    <Bar dataKey="revenue" name="營收 (NT$)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>依經銷商訂單數</CardTitle>
              <CardDescription>各經銷商訂單數量（completed/processing/on-hold）</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" width={140} fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="orders" name="訂單數" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>依經銷商已發放折扣</CardTitle>
              <CardDescription>各經銷商折扣碼已發放之折扣金額 (NT$)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
                    <YAxis type="category" dataKey="name" width={140} fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip formatter={(value: number | undefined) => value != null ? formatCurrency(value) : ''} />
                    <Legend />
                    <Bar dataKey="discount" name="折扣 (NT$)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RevenueStats;
