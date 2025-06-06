import React, { useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useRouter } from "next/router";
import api from "../../utils/api";

const EntityBuilderPage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    entityName: "",
    type: "LLC",
    owners: [{ name: "", percentage: "" }],
    registeredAgent: { name: "", address: "" },
    state: "",
    purpose: "",
    capital: [{ amount: "" }],
    additionalClauses: [] as string[],
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const handleArrayChange = (
    field: string,
    index: number,
    key: string,
    value: string
  ) => {
    setForm(prev => {
      const arr = [...(prev as any)[field]];
      (arr[index] as any)[key] = value;
      return { ...prev, [field]: arr };
    });
  };
  const handleAdd = (field: string, defaultObj: any) => {
    setForm(prev => {
      const arr = [...(prev as any)[field], defaultObj];
      return { ...prev, [field]: arr };
    });
  };
  const handleRemove = (field: string, index: number) => {
    setForm(prev => {
      const arr = [...(prev as any)[field]];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  };
  const handleSubmit = async () => {
    try {
      const payload = {
        entityName: form.entityName,
        type: form.type,
        owners: form.owners.map(o => ({ name: o.name, percentage: Number(o.percentage) })),
        registeredAgent: form.registeredAgent,
        state: form.state,
        purpose: form.purpose,
        capital: form.capital.map(c => ({ amount: Number(c.amount) })),
        additionalClauses: form.additionalClauses,
      };
      const response = await api.post("/entities/generate", payload, {
        responseType: "stream",
      });
      let draft = "";
      response.data.on("data", (chunk: any) => {
        draft += chunk.toString();
      });
      response.data.on("end", async () => {
        router.push("/entity-builder/preview");
      });
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Entity Builder</h2>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Entity Name</label>
            <Input
              name="entityName"
              value={form.entityName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Input name="state" value={form.state} onChange={handleChange} />
          </div>
          {/* Owners */}
          <div>
            <h3 className="text-lg font-medium">Owners</h3>
            {form.owners.map((o, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Name"
                  value={o.name}
                  onChange={e =>
                    handleArrayChange("owners", idx, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Percentage"
                  value={o.percentage}
                  onChange={e =>
                    handleArrayChange("owners", idx, "percentage", e.target.value)
                  }
                />
                <Button onClick={() => handleRemove("owners", idx)}>Remove</Button>
              </div>
            ))}
            <Button onClick={() => handleAdd("owners", { name: "", percentage: "" })}>
              Add Owner
            </Button>
          </div>
          {/* Registered Agent */}
          <div>
            <h3 className="text-lg font-medium">Registered Agent</h3>
            <Input
              placeholder="Name"
              value={form.registeredAgent.name}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  registeredAgent: { ...prev.registeredAgent, name: e.target.value },
                }))
              }
            />
            <Input
              placeholder="Address"
              value={form.registeredAgent.address}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  registeredAgent: { ...prev.registeredAgent, address: e.target.value },
                }))
              }
            />
          </div>
          {/* Capital Contributions */}
          <div>
            <h3 className="text-lg font-medium">Capital Contributions</h3>
            {form.capital.map((c, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Amount"
                  value={c.amount}
                  onChange={e =>
                    handleArrayChange("capital", idx, "amount", e.target.value)
                  }
                />
                <Button onClick={() => handleRemove("capital", idx)}>Remove</Button>
              </div>
            ))}
            <Button onClick={() => handleAdd("capital", { amount: "" })}>
              Add Contribution
            </Button>
          </div>
          <Button onClick={handleSubmit}>Generate Entity</Button>
        </div>
      </Card>
    </div>
  );
};

export default EntityBuilderPage;
