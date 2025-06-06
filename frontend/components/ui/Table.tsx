import React from "react";

type TableProps = {
  columns: { header: string; accessor: string }[];
  data: Record<string, any>[];
};

const Table: React.FC<TableProps> = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-2xl shadow">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="px-4 py-2 text-left text-gray-700 font-medium"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              {columns.map((col) => (
                <td key={col.accessor} className="px-4 py-2">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
