import Image from "next/image";

export default function TopBar() {
  return (
    <header className="flex items-center justify-end px-6 py-4 border-b border-white/6 bg-[#0f0f0f]">
      <div className="w-9 h-9 rounded-full bg-[#2a2a2a] overflow-hidden ring-1 ring-white/10 cursor-pointer hover:ring-white/30 transition-all">
        <Image
          src="/assets/Team.png"
          alt="User"
          width={36}
          height={36}
          className="object-cover w-full h-full"
        />
      </div>
    </header>
  );
}
