'use client';

export default function BackgroundElements() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#2ec8c6] rounded-full opacity-10 blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#2ec8c6] rounded-full opacity-10 blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#2ec8c6] rounded-full opacity-5 blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}

