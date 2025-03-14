import { importCSVDataAsJson } from "@/lib/sheetsConnector";

export const revalidate = 60;

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

export default async function Home(): Promise<React.ReactElement> {
  const itemLibraryData = await getItemLibraryData();

  return (
    <div className="min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <h1 className="text-3xl font-bold mb-8">Item Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {itemLibraryData.data.map((item, index) => (
          <div
            key={index}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4">
              {item["Tool/Supply"]}
            </h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Category:</span> {item.Category}
              </p>
              <p>
                <span className="font-medium">Type:</span>{" "}
                {item["Borrowable/Consumable"]}
              </p>
              <p>
                <span className="font-medium">Owner:</span> {item.Owner}
              </p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                {item["Contact Info"]}
              </p>
              <p>
                <span className="font-medium">Location:</span> {item.Location}
              </p>
              {item.Description && (
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {item.Description}
                </p>
              )}
              {item["Usage Notes"] && (
                <p>
                  <span className="font-medium">Usage Notes:</span>{" "}
                  {item["Usage Notes"]}
                </p>
              )}
              {item["Link/Image"] && (
                <a
                  href={item["Link/Image"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Additional Information
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getItemLibraryData(): Promise<{
  data: Array<ItemLibraryItem>;
}> {
  const itemLibraryList = await importCSVDataAsJson<ItemLibraryItem>(
    process.env.NEXT_PUBLIC_SUPPLY_LIBRARY_ITEMS_DATA_URL || "undefined"
  );
  return itemLibraryList;
}
