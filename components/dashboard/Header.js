export default function Header({ title, action }) {
  return (
    <div className="flex items-center justify-between">
      
      <h2 className="text-sm font-medium text-[#E6EDF3]">
        {title}
      </h2>

      {action && (
        <div>
          {action}
        </div>
      )}

    </div>
  )
}