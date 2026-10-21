import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 bg-surface animate-pulse">
        <div className="h-5 bg-surface-container-low rounded w-1/4 mb-6"></div>
        <div className="h-10 bg-surface-container-low rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-surface-container-low rounded w-32 mb-8"></div>
        <div className="h-[400px] bg-surface-container-low rounded-xl w-full mb-8"></div>
        <div className="flex flex-col gap-4">
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-full"></div>
          <div className="h-4 bg-surface-container-low rounded w-5/6"></div>
          <div className="h-4 bg-surface-container-low rounded w-full mt-4"></div>
          <div className="h-4 bg-surface-container-low rounded w-4/5"></div>
        </div>
      </main>
      <Footer />
    </>
  );
}
