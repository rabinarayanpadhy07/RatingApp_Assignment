import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

const SortableHeader = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = ''
}) => {
  const isActive = currentSortBy?.toLowerCase() === field?.toLowerCase();

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100/70 transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        <span className="text-gray-400">
          {isActive ? (
            currentSortOrder?.toUpperCase() === 'ASC' ? (
              <ArrowUp size={13} className="text-gray-900 stroke-[2.5]" />
            ) : (
              <ArrowDown size={13} className="text-gray-900 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown size={13} className="opacity-40 hover:opacity-80" />
          )}
        </span>
      </div>
    </th>
  );
};

export default SortableHeader;
