import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-white flex flex-col">
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6 md:py-8 mt-24 flex flex-col gap-6 animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-5 bg-surface-container-low rounded w-1/4"></div>

        {/* Hero Section Container */}
        <div className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-[16/10] bg-surface-container-low rounded-xl"></div>
              <div className="flex gap-3">
                <div className="w-24 h-16 bg-surface-container-low rounded-lg"></div>
                <div className="w-24 h-16 bg-surface-container-low rounded-lg"></div>
                <div className="w-24 h-16 bg-surface-container-low rounded-lg"></div>
              </div>
            </div>

            {/* Vehicle Info Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-8 bg-surface-container-low rounded w-3/4"></div>
              <div className="flex items-center gap-2">
                <div className="h-6 bg-surface-container-low rounded-full w-20"></div>
                <div className="h-6 bg-surface-container-low rounded-full w-16"></div>
              </div>

              <div className="h-10 bg-surface-container-low rounded w-1/2 mt-2"></div>

              {/* 8-box grid skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-16 bg-surface-container-low rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specs and Sidebar Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-surface-container-low rounded-2xl"></div>
          <div className="lg:col-span-1 h-96 bg-surface-container-low rounded-2xl"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
