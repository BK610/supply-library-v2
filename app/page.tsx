import { importCSVDataAsJson } from "@/lib/sheetsConnector";
import ItemLibrary from "@/components/ItemLibrary";
import { ItemLibraryItem } from "@/types/ItemLibraryItem";

export const revalidate = 60;

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
