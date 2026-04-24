export default function Card({ children, className = "" }) {
  return (
    <div className={`bg-[#161B22] border border-[#2A2F36] rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}