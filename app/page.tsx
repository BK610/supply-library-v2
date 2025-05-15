import Link from "next/link";
import { Button } from "@/app/components/ui/button";

export default function Home(): React.ReactElement {
  return (
    <div className=" flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Share what you have, borrow what you need
            </h2>
            <p className="text-xl text-gray-600">
              Your neighborhood's collaborative library of things.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="bg-amber-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-3">
                Have stuff gathering dust?
              </h3>
              <p className="text-gray-700 mb-4">
                That power drill you use twice a year. The camping gear in your
                garage. The bread maker you bought with good intentions. Let
                your community borrow them instead of letting them sit unused!
              </p>
            </div>

            <div className="bg-emerald-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold mb-3">
                Need something short-term?
              </h3>
              <p className="text-gray-700 mb-4">
                Why buy things you'll only use occasionally? Borrow tools,
                kitchen gadgets, outdoor gear, and more from your neighbors and
                friends. Save money and storage space!
              </p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-semibold mb-4">How it works</h3>
            <ol className="space-y-6">
              <li className="flex gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-lg">
                    Create or join a community
                  </h4>
                  <p className="text-gray-600">
                    Start with your neighbors, friends, church group, or
                    coworkers. Any group that wants to share resources.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-lg">
                    Add items you're willing to share
                  </h4>
                  <p className="text-gray-600">
                    List things you don't mind lending out to your community
                    members.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-lg">Borrow what you need</h4>
                  <p className="text-gray-600">
                    Browse what others have shared and request to borrow items
                    when you need them.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold mb-6">
              Ready to start sharing?
            </h3>
            <Link href="/login">
              <Button size="lg" className="px-8">
                Create your account
              </Button>
            </Link>
            <p className="mt-4 text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <div className="bg-blue-50 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">
              The story behind Supply Library
            </h3>
            <p className="text-gray-700 mb-4">
              We started Supply Library because we noticed how many things in
              our own homes were only used occasionally. Why should everyone on
              the block own their own ladder, stand mixer, or pressure washer?
              By sharing resources, we save money, reduce clutter, and connect
              with our communities in meaningful ways.
            </p>
            <p className="text-gray-700">
              Like borrowing a cup of sugar from a neighbor, but for everything
              else you might need!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
