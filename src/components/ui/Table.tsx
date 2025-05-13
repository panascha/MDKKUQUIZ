"use client";

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";

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
        <table
            className={cn(
                "table-auto mt-2 w-full md:w-2/3 bg-white shadow-md rounded-lg",
                "border border-gray-300 text-sm md:text-base border-separate border-spacing-0"
            )}
        >
            <thead className="border-gray-300">
                <tr className={cn("hover:bg-gray-100 text-gray-500", "transition duration-300")}>
                    {headers.map((header, index) => (
                        <th key={index} className={cn("p-3 md:p-4 text-left")}>
                            <button
                                className={cn(
                                    "p-1 hover:text-black hover:bg-gray-200",
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
                            "transition duration-300 cursor-pointer"
                        )}
                        onClick={() =>
                            row.Action && typeof row.Action === "object" && "path" in row.Action
                                ? handleRowClick(row.Action.path as string)
                                : undefined
                        }
                    >
                        {headers.map((header, colIndex) => (
                            <td key={colIndex} className={cn("p-3 md:p-4")}>
                                {row[header] && typeof row[header] === "object" && "path" in row[header] ? (
                                    <Link
                                        href={row[header].path as string}
                                        className={cn(
                                            "hover:text-blue-600 hover:underline transition duration-300 ease-in-out"
                                        )}
                                    >
                                        {"label" in row[header] && typeof row[header].label === "string"
                                            ? row[header].label
                                            : "Go to Page"}
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
    );
};

// Usage Example
      {/* <Table
        headers={["Name", "Email", "Year", "Action"]}
        data={[
          {
            Name: "John Doe",
            Email: "john.doe@example.com",
            Year: 2020,
            Action: (
              <a href="/profile/johndoe" className="text-blue-500 hover:underline">
                View Profile
              </a>
            )
          },
          {
            Name: "Jane Smith",
            Email: "jane.smith@example.com",
            Year: 2021,
            Action: (
              <a href="/profile/janesmith" className="text-blue-500 hover:underline">
                View Profile
              </a>
            )
          },
          {
            Name: "Sam Wilson",
            Email: "sam.wilson@example.com",
            Year: 2022,
            Action: (
              <a href="/profile/samwilson" className="text-blue-500 hover:underline">
                View Profile
              </a>
            )
          }
        ]}
      /> */}