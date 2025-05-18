"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type TableProps = {
  headers: string[];
  data: Array<{ [key: string]: React.ReactNode }>;
};

export const Table: React.FC<TableProps> = ({ headers, data }) => {
  const router = useRouter();

  const handleRowClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <table
        className={cn(
          "table-auto mt-2 w-full bg-white shadow-md rounded-lg",
          "border border-gray-300 text-sm md:text-base border-separate border-spacing-0"
        )}
      >
        <thead className="border-gray-300">
          <tr className={cn("hover:bg-gray-100 text-gray-500", "transition duration-300")}>
            {headers.map((header, index) => (
              <th key={index} className={cn("p-3 md:p-4 text-left")}>
                <button
                  className={cn(
                    "p-1 px-2 rounded-lg hover:text-black hover:bg-gray-200",
                    "cursor-pointer transition duration-300"
                  )}
                >
                  {header}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                "border-gray-300 hover:bg-gray-100 text-gray-700",
                "transition duration-300"
              )}
              onClick={() =>
                row.question &&
                typeof row.question === "object" &&
                "path" in row.question
                  ? handleRowClick(row.question.path as string)
                  : undefined
              }
            >
              {headers.map((header, colIndex) => (
                <td key={colIndex} className={cn("p-3 md:p-4")}>
                  {header === "question" &&
                  row[header] &&
                  typeof row[header] === "object" &&
                  "path" in row[header] &&
                  "label" in row[header] &&
                  typeof row[header].label === "string" ? (
                    <Link
                      href={row[header].path as string}
                      className={cn(
                        "hover:text-blue-600 hover:underline transition duration-300 ease-in-out"
                      )}
                    >
                      {row[header].label}
                    </Link>
                  ) : (
                    row[header]
                  )}
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

// Usage Example
// const userData = [
//     {
//       id: 1,
//       name: "Alice Wonderland",
//       email: "alice@example.com",
//       details: { path: "/users/1", label: "View Details" },
//     },
//     {
//       id: 2,
//       name: "Bob The Builder",
//       email: "bob@example.com",
//       details: { path: "/users/2" },
//     },
//     {
//       id: 3,
//       name: "Charlie Chaplin",
//       email: "charlie@example.com",
//       details: { path: "/users/3", label: "Profile" },
//     },
//   ];

//   const columns = ["id", "name", "email", "details"];

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-semibold mb-4">User List</h2>
//       <Table headers={columns} data={userData} />
//     </div>
//   );