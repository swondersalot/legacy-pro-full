import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../utils/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const EntityPreviewPage: React.FC = () => {
  const { data, mutate } = useSWR("/entities/latest", fetcher);
  const [loading, setLoading] = useState(false);

  const finalizeEntity = async () => {
    setLoading(true);
    try {
      const { id } = data;
      const res = await api.post(\`/entities/\${id}/finalize\`);
      window.open(res.data.url, "_blank");
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <Card><p>Loading...</p></Card>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Entity Preview</h2>
      <Card>
        <div className="whitespace-pre-wrap mb-4">{data.data.text}</div>
        <Button onClick={finalizeEntity} disabled={loading}>
          {loading ? "Finalizing..." : "Finalize & Download"}
        </Button>
      </Card>
    </div>
  );
};

export default EntityPreviewPage;
