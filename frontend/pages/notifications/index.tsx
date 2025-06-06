import React from "react";
import useSWR from "swr";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const NotificationsPage: React.FC = () => {
  const { data, mutate } = useSWR("/notifications", fetcher);
  if (!data) return <Card><p>Loading...</p></Card>;

  const markRead = async (id: string) => {
    await api.patch(\`/users/notifications/\${id}/mark-read\`);
    mutate();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
      {data.map((notif: any) => (
        <Card key={notif.id}>
          <div className="flex justify-between items-center">
            <p>{notif.content.message}</p>
            {!notif.read && (
              <Button onClick={() => markRead(notif.id)}>Mark as Read</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotificationsPage;
