import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function Header(): React.ReactElement {
  return (
    <header className="bg-white border-b py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-medium">Supply Library</h1>
        </Link>
        <nav>
          <Link href="/login">
            <Button variant="outline" className="mr-2">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button>Join us</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
