import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="w-full bg-surface animate-pulse">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 pt-6">
          <div className="h-5 bg-surface-container-low rounded w-1/4 mb-4"></div>
          
          <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm h-96 mb-8 flex gap-4">
             <div className="flex-1 bg-surface-container-lowest rounded-xl border border-border-subtle"></div>
             <div className="flex-1 bg-surface-container-lowest rounded-xl border border-border-subtle"></div>
          </div>
          
          <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm h-96 mb-8">
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
