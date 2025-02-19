export default function AtomLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="atom-loader">
        <div className="nucleus"></div>
        <div className="electron electron-1"></div>
        <div className="electron electron-2"></div>
        <div className="electron electron-3"></div>
      </div>
      <div className="mt-4 text-primary font-medium animate-pulse">
        Loading Knowledge...
      </div>
    </div>
  );
}
