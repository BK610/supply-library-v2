"use client";

interface ItemFiltersProps {
  categories: string[];
  types: string[];
  owners: string[];
  selectedCategory: string;
  selectedType: string;
  selectedOwner: string;
  onFilterChange: (category: string, type: string, owner: string) => void;
}

export default function ItemFilters({
  categories,
  types,
  owners,
  selectedCategory,
  selectedType,
  selectedOwner,
  onFilterChange,
}: ItemFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) =>
            onFilterChange(e.target.value, selectedType, selectedOwner)
          }
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.sort().map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Type
        </label>
        <select
          value={selectedType}
          onChange={(e) =>
            onFilterChange(selectedCategory, e.target.value, selectedOwner)
          }
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          {types.sort().map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Owner
        </label>
        <select
          value={selectedOwner}
          onChange={(e) =>
            onFilterChange(selectedCategory, selectedType, e.target.value)
          }
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Owners</option>
          {owners.sort().map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
