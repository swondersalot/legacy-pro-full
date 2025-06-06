import React, { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useRouter } from "next/router";
import api from "../../utils/api";

const LegacyLetterPage: React.FC = () => {
  const router = useRouter();
  const [tone, setTone] = useState("");
  const [recipients, setRecipients] = useState([{ name: "" }]);
  const [attachedDocs, setAttachedDocs] = useState<string[]>([]);
  const handleRecipientChange = (index: number, value: string) => {
    const newArr = [...recipients];
    newArr[index].name = value;
    setRecipients(newArr);
  };
  const handleAddRecipient = () => {
    setRecipients(prev => [...prev, { name: "" }]);
  };
  const handleRemoveRecipient = (index: number) => {
    const newArr = [...recipients];
    newArr.splice(index, 1);
    setRecipients(newArr);
  };
  const handleSubmit = async () => {
    try {
      const payload = { tone, recipients: recipients.map(r => r.name), attachedDocs };
      const response = await api.post("/legacy-letter/generate", payload, {
        responseType: "stream",
      });
      let draft = "";
      response.data.on("data", (chunk: any) => {
        draft += chunk.toString();
      });
      response.data.on("end", async () => {
        router.push("/legacy-letter/preview");
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Legacy Letter</h2>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tone</label>
            <Input value={tone} onChange={e => setTone(e.target.value)} />
          </div>
          <div>
            <h3 className="text-lg font-medium">Recipients</h3>
            {recipients.map((r, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Recipient Name"
                  value={r.name}
                  onChange={e => handleRecipientChange(idx, e.target.value)}
                />
                <Button onClick={() => handleRemoveRecipient(idx)}>Remove</Button>
              </div>
            ))}
            <Button onClick={handleAddRecipient}>Add Recipient</Button>
          </div>
          {/* Attached Docs: This could be a multiselect from Vault; simplified as comma-separated */}
          <div>
            <label className="block text-sm font-medium mb-1">Attached Docs (comma-separated keys)</label>
            <Input
              value={attachedDocs.join(",")}
              onChange={e => setAttachedDocs(e.target.value.split(","))}
            />
          </div>
          <Button onClick={handleSubmit}>Generate Letter</Button>
        </div>
      </Card>
    </div>
  );
};

export default LegacyLetterPage;
