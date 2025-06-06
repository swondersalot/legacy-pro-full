import React from "react";
import useSWR from "swr";
import api from "../../utils/api";
import Card from "../../components/ui/Card";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const ProtectionScorePage: React.FC = () => {
  const { data } = useSWR("/protection-score", fetcher);
  if (!data) return <Card><p>Loading...</p></Card>;

  const { score, breakdown, suggestions } = data;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Protection Score</h2>
      <Card>
        <p className="text-xl">Total Score: {score}</p>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Breakdown:</h3>
          <ul className="list-disc ml-6">
            <li>Trust: {breakdown.trust}</li>
            <li>Entity: {breakdown.entity}</li>
            <li>Vault: {breakdown.vault}</li>
            <li>Security: {breakdown.security}</li>
            <li>Financial: {breakdown.financial}</li>
          </ul>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-medium">Suggestions:</h3>
          <ul className="list-disc ml-6">
            {suggestions.map((s: string, idx: number) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ProtectionScorePage;
