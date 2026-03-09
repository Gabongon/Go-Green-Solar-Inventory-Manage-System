import React from 'react';

export const TableRowSkeleton = ({ columns }) => {
  return (
    <tr className="animate-pulse">
      {Array(columns).fill(0).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export default TableRowSkeleton;