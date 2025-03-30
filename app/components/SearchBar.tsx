"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative mb-6">
      <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
        Search
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by tool name or description..."
        className="w-full rounded-md px-4 py-2 pl-10 outline dark:outline-gray-700 outline-gray-400 hover:outline-gray-600 dark:hover:outline-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-2 focus:outline-blue-500 hover:focus:outline-blue-500"
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
  );
}
