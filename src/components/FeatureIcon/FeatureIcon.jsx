// Outline icons used by the home page highlights. The names match the
// HomeFeature.icon choices in the Django admin.
const ICON_PATHS = {
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a.5.5 0 0 0-.5.5V8a3 3 0 0 0 3 3M17 6h2.5a.5.5 0 0 1 .5.5V8a3 3 0 0 1-3 3" />
      <path d="M12 14v4M8 21h8M9.5 18h5l.5 3H9l.5-3Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.3 7.5 9.5 4.3-1.2 7.5-5 7.5-9.5V6L12 3Z" />
      <path d="M12 17v-6M12 13c-2 0-3-1.3-3-3.2 2 0 3 1.2 3 3.2ZM12 11.5c0-2 1-3.3 3-3.3 0 2-1 3.3-3 3.3Z" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="5.5" cy="9" r="2" />
      <circle cx="18.5" cy="9" r="2" />
      <path d="M7.5 19v-2a4.5 4.5 0 0 1 9 0v2Z" />
      <path d="M2.5 18v-1.5a3 3 0 0 1 4.6-2.5M21.5 18v-1.5a3 3 0 0 0-4.6-2.5" />
    </>
  ),
  box: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4M12 11v10M8 5l8 4v3" />
    </>
  ),
  truck: (
    <>
      <path d="M2.5 6h11v10h-11zM13.5 9.5h4l3 3.5V16h-7" />
      <circle cx="6.5" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
      <path d="M6 9.5h3M7.5 8v3" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />
      <path d="M8.5 12.5h2l1-2 1.5 4 1-2h1.5" />
    </>
  ),
}

export default function FeatureIcon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICON_PATHS[name] || ICON_PATHS.trophy}
    </svg>
  )
}
