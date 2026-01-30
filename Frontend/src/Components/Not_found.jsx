export default function Not_Found() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-slate-900 to-black text-white px-6">
      <h1 className="text-8xl md:text-9xl font-extrabold text-blue-500 animate-pulse">404</h1>
      <p className="mt-4 text-2xl md:text-3xl font-semibold">Oops! Page not found</p>
      <p className="mt-2 text-center text-gray-400 max-w-md">The page you're looking for doesn't exist, was moved, or is hiding from you</p>
      <div className="w-24 h-1 bg-blue-500 rounded-full my-6" />
      <div className="flex gap-4">
        <a href="/home" className="px-6 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 transition !text-white">Go Home</a>
        <button onClick={() => window.history.back()} className="px-6 py-3 rounded-lg border border-gray-600 hover:bg-gray-800 transition">Go Back</button>
      </div>
    </div>
  );
}
