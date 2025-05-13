"use client";

import { useEffect, useState } from "react";
import ItemFilters from "@/components/ItemFilters";
import SearchBar from "@/components/SearchBar";
import ItemLibraryItem from "@/components/ItemLibraryItem";
import { ItemLibraryItem as ItemLibraryItemType } from "@/types/ItemLibraryItem";

// function isPhoneNumber(str: string): boolean {
//   return /^\+?[\d\s-()]+$/.test(str);
// }

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
  initialData: ItemLibraryItemType[];
}

export default function ItemLibrary({
  initialData,
}: ItemLibraryProps): React.ReactElement {
  const [filteredItems, setFilteredItems] =
    useState<ItemLibraryItemType[]>(initialData);
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
    <div className="h-full p-8 pb-20 gap-8 sm:p-20">
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
      <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-300">
        Results
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const categoryColor = getColor(item.Category, categoryColors);
            const typeColor = getColor(
              item["Borrowable/Consumable"],
              typeColors
            );

            return (
              <ItemLibraryItem
                key={index}
                item={item}
                categoryColor={categoryColor}
                typeColor={typeColor}
              />
            );
          })
        ) : (
          <div className="pt-1">
            <p className="text-sm">We don&apos;t have that... yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
