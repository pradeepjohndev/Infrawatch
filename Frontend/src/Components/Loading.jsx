export default function Loading({ message = "Loading..." }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-500 border-t-white" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
}
