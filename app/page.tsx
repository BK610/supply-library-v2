import { importCSVDataAsJson } from "@/lib/sheetsConnector";
import ItemLibrary from "./components/ItemLibrary";

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

async function getItemLibraryData(): Promise<{
  data: Array<ItemLibraryItem>;
}> {
  const itemLibraryList = await importCSVDataAsJson<ItemLibraryItem>(
    process.env.NEXT_PUBLIC_SUPPLY_LIBRARY_ITEMS_DATA_URL || "undefined"
  );
  return itemLibraryList;
}

export default async function Home(): Promise<React.ReactElement> {
  const itemLibraryData = await getItemLibraryData();

  return <ItemLibrary initialData={itemLibraryData.data} />;
}
