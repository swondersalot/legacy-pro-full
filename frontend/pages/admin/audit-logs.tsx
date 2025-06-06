import React, { useState } from "react";
import useSWR from "swr";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Table from "../../components/ui/Table";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState({ resourceType: "", action: "" });
  const { data } = useSWR(
    \`/admin/audit-logs?resourceType=\${filters.resourceType}&action=\${filters.action}\`,
    fetcher
  );

  if (!data) return <Card><p>Loading...</p></Card>;

  const columns = [
    { header: "Timestamp", accessor: "timestamp" },
    { header: "User", accessor: "user.name" },
    { header: "Resource", accessor: "resourceType" },
    { header: "Action", accessor: "action" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
      <Card>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Resource Type"
            value={filters.resourceType}
            onChange={e => setFilters(prev => ({ ...prev, resourceType: e.target.value }))}
          />
          <Input
            placeholder="Action"
            value={filters.action}
            onChange={e => setFilters(prev => ({ ...prev, action: e.target.value }))}
          />
          <Button onClick={() => useSWR(\`/admin/audit-logs?resourceType=\${filters.resourceType}&action=\${filters.action}\`, fetcher).mutate()}>
            Filter
          </Button>
        </div>
        <Table columns={columns} data={data} />
      </Card>
    </div>
  );
};

export default AuditLogsPage;
