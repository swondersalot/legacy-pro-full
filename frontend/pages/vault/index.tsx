import React, { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../utils/api";
import useSWR from "swr";

const fetcher = (url: string) => api.get(url).then(res => res.data);

const VaultPage: React.FC = () => {
  const { data: folders } = useSWR("/vault", fetcher);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { data: files } = useSWR(
    selectedFolder ? \`/vault/folders/\${selectedFolder}/files\` : null,
    fetcher
  );
  const [newFolderName, setNewFolderName] = useState("");
  const createFolder = async () => {
    try {
      await api.post("/vault/folders", {
        name: newFolderName,
        parentId: selectedFolder,
      });
      setNewFolderName("");
      // Revalidate
      useSWR("/vault", fetcher).mutate();
    } catch (error) {
      console.error(error);
    }
  };
  const getUploadUrl = async (file: File) => {
    const { data } = await api.post("/vault/upload-url", {
      fileName: file.name,
      fileType: file.type,
      size: file.size,
    });
    return data;
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !selectedFolder) return;
    const file = e.target.files[0];
    try {
      const { key, url } = await getUploadUrl(file);
      await fetch(url, { method: "PUT", body: file });
      await api.post("/vault/files", {
        fileName: file.name,
        fileType: file.type,
        size: file.size,
        folderId: selectedFolder,
        s3Key: key,
      });
      // Revalidate
      useSWR(\`/vault/folders/\${selectedFolder}/files\`, fetcher).mutate();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Vault</h2>
      <div className="flex space-x-6">
        {/* Folder List */}
        <Card className="w-1/4">
          <h3 className="text-lg font-medium mb-2">Folders</h3>
          <ul>
            {folders?.map((f: any) => (
              <li key={f.id}>
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setSelectedFolder(f.id)}
                >
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <Input
              placeholder="New Folder Name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
            />
            <Button onClick={createFolder}>Create Folder</Button>
          </div>
        </Card>
        {/* File List */}
        <Card className="flex-1">
          <h3 className="text-lg font-medium mb-2">
            {selectedFolder ? "Files" : "Select a Folder"}
          </h3>
          {selectedFolder && (
            <>
              <input type="file" onChange={handleFileChange} />
              <ul className="mt-4">
                {files?.map((file: any) => (
                  <li key={file.id} className="flex justify-between mb-2">
                    <span>{file.fileName}</span>
                    <a
                      href={file.url}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default VaultPage;
