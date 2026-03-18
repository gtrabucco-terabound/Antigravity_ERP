'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MOCK_TENANTS, MOCK_PLANS, MOCK_MODULES } from "@/app/lib/mock-data";
import { Users, Globe, Package, Zap, ArrowUpRight, Activity, ShieldCheck } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function DashboardPage() {
  const activeTenants = MOCK_TENANTS.filter(t => t.status === 'active').length;
  const totalModules = MOCK_MODULES.length;
  const totalRevenue = MOCK_TENANTS.reduce((acc, t) => {
    const plan = MOCK_PLANS.find(p => p.id === t.planId);
    return acc + (plan?.price || 0);
  }, 0);

  const revenueData = [
    { month: 'Jan', revenue: 1200 },
    { month: 'Feb', revenue: 1800 },
    { month: 'Mar', revenue: 2400 },
    { month: 'Apr', revenue: 3100 },
    { month: 'May', revenue: 3800 },
    { month: 'Jun', revenue: totalRevenue },
  ];

  const stats = [
    { label: "Total Tenants", value: MOCK_TENANTS.length, icon: Users, trend: "+12%", color: "text-blue-500" },
    { label: "Active Subscriptions", value: activeTenants, icon: Zap, trend: "+5%", color: "text-green-500" },
    { label: "Global Revenue", value: `$${totalRevenue.toLocaleString()}/mo`, icon: Globe, trend: "+24%", color: "text-primary" },
    { label: "Active Modules", value: totalModules, icon: Package, trend: "Stable", color: "text-purple-500" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
        <p className="text-muted-foreground">Real-time governance dashboard for Terabound ERP.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/50 hover:bg-card transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                <span className="text-green-500 font-medium flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.trend}
                </span>
                <span className="ml-1">since last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Platform Revenue Growth</CardTitle>
            <CardDescription>Estimated monthly recurring revenue (MRR) across all tenants.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest governance actions from administrators.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[
                { action: "Tenant Created", entity: "Acme Corp", time: "2h ago", icon: Users },
                { action: "Plan Updated", entity: "Globex Ltd", time: "4h ago", icon: Activity },
                { action: "Module Active", entity: "Financials", time: "8h ago", icon: Zap },
                { action: "Security Audit", entity: "Manual Review", time: "1d ago", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.action}</p>
                    <p className="text-xs text-muted-foreground">{item.entity}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
