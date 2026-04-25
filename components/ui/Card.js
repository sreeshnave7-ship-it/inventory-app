export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#161B22]
        border border-[#2A2F36]
        rounded-2xl
        p-4

        shadow-[0_2px_10px_rgba(0,0,0,0.2)]

        transition-all duration-300 ease-out

        hover:border-[#3A4149]
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.45)]
        hover:-translate-y-[2px]

        active:translate-y-[1px]
        active:shadow-[0_4px_12px_rgba(0,0,0,0.3)]`}>
      {children}
    </div>
  );
}