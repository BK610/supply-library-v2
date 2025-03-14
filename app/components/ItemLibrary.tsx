"use client";

import { useEffect, useState } from "react";
import ItemFilters from "./ItemFilters";
import SearchBar from "./SearchBar";

interface ItemLibraryItem {
  "Tool/Supply": string;
  Category: string;
  "Borrowable/Consumable": string;
  Owner: string;
  "Contact Info": string;
  Location: string;
  Description: string;
  "Link/Image": string;
  "Usage Notes": string;
}

function isPhoneNumber(str: string): boolean {
  return /^\+?[\d\s-()]+$/.test(str);
}

// Predefined color combinations for dynamic assignment
const colorSchemes = [
  {
    bg: "bg-blue-100 dark:bg-blue-900",
    text: "text-blue-800 dark:text-blue-100",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900",
    text: "text-purple-800 dark:text-purple-100",
  },
  {
    bg: "bg-green-100 dark:bg-green-900",
    text: "text-green-800 dark:text-green-100",
  },
  {
    bg: "bg-orange-100 dark:bg-orange-900",
    text: "text-orange-800 dark:text-orange-100",
  },
  {
    bg: "bg-pink-100 dark:bg-pink-900",
    text: "text-pink-800 dark:text-pink-100",
  },
  {
    bg: "bg-indigo-100 dark:bg-indigo-900",
    text: "text-indigo-800 dark:text-indigo-100",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-900",
    text: "text-teal-800 dark:text-teal-100",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900",
    text: "text-amber-800 dark:text-amber-100",
  },
];

// Create a color mapping based on unique values
function createColorMapping(values: string[]): {
  [key: string]: { bg: string; text: string };
} {
  const mapping: { [key: string]: { bg: string; text: string } } = {};
  values.forEach((value, index) => {
    mapping[value] = colorSchemes[index % colorSchemes.length];
  });
  return mapping;
}

interface ItemLibraryProps {
  initialData: ItemLibraryItem[];
}

export default function ItemLibrary({
  initialData,
}: ItemLibraryProps): React.ReactElement {
  const [filteredItems, setFilteredItems] =
    useState<ItemLibraryItem[]>(initialData);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [categoryColors, setCategoryColors] = useState<{
    [key: string]: { bg: string; text: string };
  }>({});
  const [typeColors, setTypeColors] = useState<{
    [key: string]: { bg: string; text: string };
  }>({});

  useEffect(() => {
    // Extract unique values for filters
    const uniqueCategories = Array.from(
      new Set(initialData.map((item) => item.Category))
    );
    const uniqueTypes = Array.from(
      new Set(initialData.map((item) => item["Borrowable/Consumable"]))
    );
    const uniqueOwners = Array.from(
      new Set(initialData.map((item) => item.Owner))
    );

    setCategories(uniqueCategories);
    setTypes(uniqueTypes);
    setOwners(uniqueOwners);

    // Create color mappings
    setCategoryColors(createColorMapping(uniqueCategories));
    setTypeColors(createColorMapping(uniqueTypes));
  }, [initialData]);

  useEffect(() => {
    const filtered = initialData.filter((item) => {
      // Apply category, type, and owner filters
      const matchesCategory =
        !selectedCategory || item.Category === selectedCategory;
      const matchesType =
        !selectedType || item["Borrowable/Consumable"] === selectedType;
      const matchesOwner = !selectedOwner || item.Owner === selectedOwner;

      // Apply search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item["Tool/Supply"].toLowerCase().includes(searchLower) ||
        (item.Description &&
          item.Description.toLowerCase().includes(searchLower));

      return matchesCategory && matchesType && matchesOwner && matchesSearch;
    });
    setFilteredItems(filtered);
  }, [selectedCategory, selectedType, selectedOwner, searchQuery, initialData]);

  const handleFilterChange = (
    category: string,
    type: string,
    owner: string
  ) => {
    setSelectedCategory(category);
    setSelectedType(type);
    setSelectedOwner(owner);
  };

  // Get color for a category or type, with fallback
  const getColor = (
    value: string,
    mapping: { [key: string]: { bg: string; text: string } }
  ) => {
    return (
      mapping[value] || {
        bg: "bg-gray-100 dark:bg-gray-900",
        text: "text-gray-800 dark:text-gray-100",
      }
    );
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-8 sm:p-20 bg-gray-50 dark:bg-gray-900">
      <div className="mb-4">
        <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
          Supply Library
        </h1>
        <p className="text-gray-700 dark:text-gray-400">
          A little friendly neighborhood library... of supplies!
        </p>
      </div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <ItemFilters
        categories={categories}
        types={types}
        owners={owners}
        selectedCategory={selectedCategory}
        selectedType={selectedType}
        selectedOwner={selectedOwner}
        onFilterChange={handleFilterChange}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, index) => {
          const categoryColor = getColor(item.Category, categoryColors);
          const typeColor = getColor(item["Borrowable/Consumable"], typeColors);

          return (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                {item["Tool/Supply"]}
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-3 py-1 ${categoryColor.bg} ${categoryColor.text} rounded-full text-sm font-medium`}
                >
                  {item.Category}
                </span>
                <span
                  className={`px-3 py-1 ${typeColor.bg} ${typeColor.text} rounded-full text-sm font-medium`}
                >
                  {item["Borrowable/Consumable"]}
                </span>
              </div>
              <div className="space-y-3">
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Owner:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {item.Owner}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Contact:
                  </span>
                  {isPhoneNumber(item["Contact Info"]) ? (
                    <a
                      href={`tel:${item["Contact Info"].replace(/\s+/g, "")}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {item["Contact Info"]}
                    </a>
                  ) : (
                    <span className="text-gray-900 dark:text-white">
                      {item["Contact Info"]}
                    </span>
                  )}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Location:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {item.Location}
                  </span>
                </p>
                {item.Description && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-300">
                      {item.Description}
                    </p>
                  </div>
                )}
                {item["Usage Notes"] && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Usage Notes:</span>{" "}
                      {item["Usage Notes"]}
                    </p>
                  </div>
                )}
                {item["Link/Image"] && (
                  <a
                    href={item["Link/Image"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span>View Link</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
