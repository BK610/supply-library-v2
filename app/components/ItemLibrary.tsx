"use client";

import { useEffect, useState } from "react";
import ItemFilters from "./ItemFilters";

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
  const [categories, setCategories] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [owners, setOwners] = useState<string[]>([]);

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
  }, [initialData]);

  useEffect(() => {
    const filtered = initialData.filter((item) => {
      const matchesCategory =
        !selectedCategory || item.Category === selectedCategory;
      const matchesType =
        !selectedType || item["Borrowable/Consumable"] === selectedType;
      const matchesOwner = !selectedOwner || item.Owner === selectedOwner;
      return matchesCategory && matchesType && matchesOwner;
    });
    setFilteredItems(filtered);
  }, [selectedCategory, selectedType, selectedOwner, initialData]);

  const handleFilterChange = (
    category: string,
    type: string,
    owner: string
  ) => {
    setSelectedCategory(category);
    setSelectedType(type);
    setSelectedOwner(owner);
  };

  return (
    <div className="min-h-screen p-8 pb-20 gap-8 sm:p-20 bg-gray-50 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
        Item Library
      </h1>
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
        {filteredItems.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              {item["Tool/Supply"]}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm font-medium">
                {item.Category}
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-sm font-medium">
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
                  <span>View Additional Information</span>
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
        ))}
      </div>
    </div>
  );
}
