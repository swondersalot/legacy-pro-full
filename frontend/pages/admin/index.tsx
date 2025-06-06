import React from "react";
import useSWR from "swr";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const AdminMetricsPage: React.FC = () => {
  const { data: userMetrics } = useSWR("/admin/metrics/users", fetcher);
  const { data: subMetrics } = useSWR("/admin/metrics/subscriptions", fetcher);
  const { data: vaultMetrics } = useSWR("/admin/metrics/vault", fetcher);
  const { data: apiUsageMetrics } = useSWR("/admin/metrics/api-usage", fetcher);

  if (!userMetrics || !subMetrics || !vaultMetrics || !apiUsageMetrics)
    return <Card><p>Loading...</p></Card>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin Metrics</h2>
      <Card>
        <h3 className="text-lg font-medium">Users Growth (Last 12 Months)</h3>
        <Table
          columns={[{ header: "Month", accessor: "month" }, { header: "Count", accessor: "count" }]}
          data={userMetrics.growth}
        />
        <p className="mt-2">Total Users: {userMetrics.totalUsers}</p>
      </Card>
      <Card>
        <h3 className="text-lg font-medium">Subscriptions by Plan</h3>
        <Table
          columns={Object.keys(subMetrics.byPlan).map(plan => ({ header: plan, accessor: plan }))}
          data={[subMetrics.byPlan]}
        />
        <p className="mt-2">Churn Rate: {subMetrics.churnRate.toFixed(2)}</p>
      </Card>
      <Card>
        <h3 className="text-lg font-medium">Vault Usage (Last 12 Months)</h3>
        <Table
          columns={[{ header: "Month", accessor: "month" }, { header: "Bytes", accessor: "bytes" }]}
          data={vaultMetrics.monthlyUsage}
        />
      </Card>
      <Card>
        <h3 className="text-lg font-medium">API Usage by Feature</h3>
        <Table
          columns={Object.keys(apiUsageMetrics.callsByFeature).map(f => ({ header: f, accessor: f }))}
          data={[apiUsageMetrics.callsByFeature]}
        />
        <p className="mt-2">Error Rate: {apiUsageMetrics.errorRate}</p>
      </Card>
    </div>
  );
};

export default AdminMetricsPage;
