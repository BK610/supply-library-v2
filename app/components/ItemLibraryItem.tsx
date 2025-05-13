import { ItemLibraryItem as ItemLibraryItemType } from "@/types/ItemLibraryItem";

interface ItemLibraryItemProps {
  item: ItemLibraryItemType;
  categoryColor: { bg: string; text: string };
  typeColor: { bg: string; text: string };
}

export default function ItemLibraryItem({
  item,
  categoryColor,
  typeColor,
}: ItemLibraryItemProps): React.ReactElement {
  return (
    <div
      tabIndex={0} // Preserves natural tab order of the page, but still enables tabbing
      className="p-6 rounded-sm transition-all duration-75 shadow-sm hover:shadow-lg focus:shadow-xl
              outline outline-gray-300 dark:outline-gray-700 focus:outline-blue-500 focus:outline-4
               bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-blue-50 dark:focus:bg-blue-950"
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
          <span className="text-gray-900 dark:text-white">{item.Owner}</span>
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
}
