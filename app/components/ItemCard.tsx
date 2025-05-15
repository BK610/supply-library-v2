import { Item } from "@/lib/items";

interface ItemCardProps {
  item: Item;
  onClick?: () => void;
  className?: string;
}

/**
 * A reusable card component for displaying item information
 */
export function ItemCard({ item, onClick, className = "" }: ItemCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
      tabIndex={0}
    >
      <h3 className="font-semibold">{item.name}</h3>
      {item.description && (
        <p className="text-gray-600 text-sm mt-1">{item.description}</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {item.category && (
          <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
            {item.category}
          </span>
        )}
        {item.condition && (
          <span className="text-xs bg-green-100 text-green-800 rounded-full px-2 py-1">
            {item.condition}
          </span>
        )}
        {item.quantity > 1 && (
          <span className="text-xs bg-purple-100 text-purple-800 rounded-full px-2 py-1">
            Qty: {item.quantity}
          </span>
        )}
        {item.consumable && (
          <span className="text-xs bg-orange-100 text-orange-800 rounded-full px-2 py-1">
            Consumable
          </span>
        )}
      </div>
    </div>
  );
}

interface ItemsGridProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
  emptyMessage?: string;
  actionButton?: React.ReactNode;
  className?: string;
}

/**
 * A grid layout for displaying multiple items
 */
export function ItemsGrid({
  items,
  onItemClick,
  emptyMessage = "No items found",
  actionButton,
  className = "",
}: ItemsGridProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">{emptyMessage}</p>
        {actionButton}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={onItemClick ? () => onItemClick(item) : undefined}
        />
      ))}
    </div>
  );
}
