import React, { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useRouter } from "next/router";
import api from "../../utils/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const TrustBuilderPage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    trustName: "",
    type: "REVOCABLE",
    grantor: { name: "", address: "" },
    trustees: [{ name: "", address: "" }],
    successorTrustees: [{ name: "", address: "" }],
    beneficiaries: [{ name: "", share: "" }],
    state: "",
    assetsIncluded: [""],
    additionalClauses: [] as string[],
  });
  const [clauses, setClauses] = useState<string[]>([]);
  const { data: stateClauses } = useSWR(
    form.state ? \`/trusts/clauses?state=\${form.state}\` : null,
    fetcher
  );

  useEffect(() => {
    if (stateClauses?.clauses) {
      setClauses(stateClauses.clauses.map((c: any) => c.id));
    }
  }, [stateClauses]);

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

  const handleAdd = (field: string) => {
    setForm(prev => {
      const arr = [...(prev as any)[field]];
      arr.push(field === "assetsIncluded" ? "" : { name: "", address: "" });
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
        trustName: form.trustName,
        type: form.type,
        grantor: form.grantor,
        trustees: form.trustees,
        successorTrustees: form.successorTrustees,
        beneficiaries: form.beneficiaries,
        state: form.state,
        assetsIncluded: form.assetsIncluded,
        additionalClauses: form.additionalClauses,
      };
      const response = await api.post("/trusts/generate", payload, {
        responseType: "stream",
      });
      let draft = "";
      response.data.on("data", (chunk: any) => {
        draft += chunk.toString();
      });
      response.data.on("end", async () => {
        // Save and redirect
        router.push("/trust-builder/preview");
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Trust Builder</h2>
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trust Name</label>
            <Input
              name="trustName"
              value={form.trustName}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <Input name="state" value={form.state} onChange={handleChange} />
          </div>
          {/* Grantor */}
          <div>
            <h3 className="text-lg font-medium">Grantor</h3>
            <Input
              placeholder="Name"
              value={form.grantor.name}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  grantor: { ...prev.grantor, name: e.target.value },
                }))
              }
            />
            <Input
              placeholder="Address"
              value={form.grantor.address}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  grantor: { ...prev.grantor, address: e.target.value },
                }))
              }
            />
          </div>
          {/* Trustees */}
          <div>
            <h3 className="text-lg font-medium">Trustees</h3>
            {form.trustees.map((_, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Name"
                  value={form.trustees[idx].name}
                  onChange={e =>
                    handleArrayChange("trustees", idx, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Address"
                  value={form.trustees[idx].address}
                  onChange={e =>
                    handleArrayChange("trustees", idx, "address", e.target.value)
                  }
                />
                <Button onClick={() => handleRemove("trustees", idx)}>Remove</Button>
              </div>
            ))}
            <Button onClick={() => handleAdd("trustees")}>Add Trustee</Button>
          </div>
          {/* Beneficiaries */}
          <div>
            <h3 className="text-lg font-medium">Beneficiaries</h3>
            {form.beneficiaries.map((b, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Name"
                  value={b.name}
                  onChange={e =>
                    handleArrayChange("beneficiaries", idx, "name", e.target.value)
                  }
                />
                <Input
                  placeholder="Share (%)"
                  value={b.share}
                  onChange={e =>
                    handleArrayChange("beneficiaries", idx, "share", e.target.value)
                  }
                />
                <Button onClick={() => handleRemove("beneficiaries", idx)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => handleAdd("beneficiaries")}>
              Add Beneficiary
            </Button>
          </div>
          {/* Assets */}
          <div>
            <h3 className="text-lg font-medium">Assets Included</h3>
            {form.assetsIncluded.map((asset, idx) => (
              <div key={idx} className="flex space-x-2 mb-2">
                <Input
                  placeholder="Asset Description"
                  value={asset}
                  onChange={e =>
                    handleArrayChange("assetsIncluded", idx, "", e.target.value)
                  }
                />
                <Button onClick={() => handleRemove("assetsIncluded", idx)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => handleAdd("assetsIncluded")}>
              Add Asset
            </Button>
          </div>
          {/* Additional Clauses */}
          <div>
            <h3 className="text-lg font-medium">Additional Clauses</h3>
            {stateClauses?.clauses?.map((clause: any) => (
              <div key={clause.id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  className="mr-2"
                  value={clause.id}
                  onChange={e => {
                    const id = e.target.value;
                    setForm(prev => {
                      const exists = prev.additionalClauses.includes(id);
                      const updated = exists
                        ? prev.additionalClauses.filter(c => c !== id)
                        : [...prev.additionalClauses, id];
                      return { ...prev, additionalClauses: updated };
                    });
                  }}
                />
                <span className="text-sm">{clause.text.slice(0, 60)}...</span>
              </div>
            ))}
          </div>
          <Button onClick={handleSubmit}>Generate Trust</Button>
        </div>
      </Card>
    </div>
  );
};

export default TrustBuilderPage;
