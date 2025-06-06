import React from "react";
import Card from "../../components/ui/Card";

const DashboardPage: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <Card>
        <p>Welcome to your dashboard. Metrics will appear here.</p>
      </Card>
    </div>
  );
};

export default DashboardPage;
