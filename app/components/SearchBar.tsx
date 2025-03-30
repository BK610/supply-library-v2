"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white dark:bg-gray-800 shadow-sm outline outline-gray-700 dark:outline-gray-300">
      <div className="relative w-full">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Search
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by tool name or description..."
          className="w-full px-4 py-2 pl-10 outline dark:outline-gray-700 outline-gray-300 hover:outline-gray-500 dark:hover:outline-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 bottom-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>
  );
}
