"use client";

import React from "react";
import { cn } from "../../lib/utils";

type TableProps = {
    headers: string[];
    data: Array<{ [key: string]: React.ReactNode }>;
};

export const Table: React.FC<TableProps> = ({ headers, data }) => {

    return (
        <table
            className={cn(
            "table-auto mt-2 w-full xl:w-8/10 bg-white shadow-md rounded-lg",
            "border border-gray-300 text-sm md:text-base border-separate border-spacing-0"
            )}
        >
            <thead className="border-b border-gray-300 bg-gray-50">
            <tr className={cn("hover:bg-gray-100 text-gray-500", "transition duration-300")}>
                {headers.map((header, index) => (
                <th key={index} className={cn("p-3 md:p-4 text-left")}>
                    {header}
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
                    >
                        {headers.map((header, colIndex) => (
                            <td key={colIndex} className={cn("p-3 md:p-4")}>
                                {row[header]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default Table;

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