import React, { useState, useEffect } from "react";
import useSWR from "swr";
import api from "../../utils/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const SettingsPage: React.FC = () => {
  const { data: user } = useSWR("/users/me", fetcher);
  const [name, setName] = useState("");
  const [locale, setLocale] = useState("");
  const [twoFASetupUrl, setTwoFASetupUrl] = useState<string | null>(null);
  const [twoFAToken, setTwoFAToken] = useState("");
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setLocale(user.locale || "");
    }
  }, [user]);

  const updateProfile = async () => {
    await api.patch("/users/me", { name, locale });
    alert("Profile updated");
  };

  const setup2FA = async () => {
    const res = await api.post("/users/me/2fa/setup");
    setTwoFASetupUrl(res.data.qrCodeDataURL);
  };

  const verify2FA = async () => {
    await api.post("/users/me/2fa/verify", { token: twoFAToken });
    alert("2FA enabled");
  };

  const disable2FA = async () => {
    await api.delete("/users/me/2fa");
    alert("2FA disabled");
  };

  if (!user) return <Card><p>Loading...</p></Card>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Locale</label>
            <Input value={locale} onChange={e => setLocale(e.target.value)} />
          </div>
          <Button onClick={updateProfile}>Update Profile</Button>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
        {!user.twoFAEnabled ? (
          <>
            <Button onClick={setup2FA}>Setup 2FA</Button>
            {twoFASetupUrl && (
              <div className="mt-4">
                <img src={twoFASetupUrl} alt="QR Code" />
                <Input
                  placeholder="Enter token"
                  value={twoFAToken}
                  onChange={e => setTwoFAToken(e.target.value)}
                  className="mt-2"
                />
                <Button onClick={verify2FA}>Verify 2FA</Button>
              </div>
            )}
          </>
        ) : (
          <Button onClick={disable2FA}>Disable 2FA</Button>
        )}
      </Card>
    </div>
  );
};

export default SettingsPage;
