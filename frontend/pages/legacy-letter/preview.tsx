import React, { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../utils/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const LegacyLetterPreviewPage: React.FC = () => {
  const { data, mutate } = useSWR("/legacy-letter/latest", fetcher);
  const [loading, setLoading] = useState(false);

  const finalizeLetter = async () => {
    setLoading(true);
    try {
      const { id } = data;
      const res = await api.post(\`/legacy-letter/\${id}/finalize\`);
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
      <h2 className="text-2xl font-semibold mb-4">Legacy Letter Preview</h2>
      <Card>
        <div className="whitespace-pre-wrap mb-4">{data.body}</div>
        <Button onClick={finalizeLetter} disabled={loading}>
          {loading ? "Finalizing..." : "Finalize & Download"}
        </Button>
      </Card>
    </div>
  );
};

export default LegacyLetterPreviewPage;
