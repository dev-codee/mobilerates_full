import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-surface min-h-screen">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          {/* Breadcrumb Skeleton */}
          <div className="w-48 h-5 bg-gray-200 rounded animate-pulse mb-6"></div>
        </div>
        
        {/* CompareClient Skeleton */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pb-12">
          {/* Top selection area */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4 shadow-sm h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-24 h-32 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>

          {/* Specs table area skeleton */}
          <div className="bg-white rounded-xl border overflow-hidden shadow-sm animate-pulse">
            <div className="h-16 border-b bg-gray-50 px-6 flex items-center">
              <div className="w-32 h-5 bg-gray-200 rounded"></div>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 border-b px-6 flex items-center gap-4">
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
                <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Comparisons Skeleton */}
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-xl border p-4 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
