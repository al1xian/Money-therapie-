type IconProps = {className?: string};

export function BurgerIcon({className}: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({className}: IconProps) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11.5 11.5L15.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function BagIcon({className}: IconProps) {
  return (
    <svg className={className} width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path
        d="M3.5 5.5h10l-.5 9.5H4l-.5-9.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M6 5.5v-1a2.5 2.5 0 015 0v1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({className}: IconProps) {
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InstagramIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="3.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="11.4" cy="4.6" r="0.7" fill="currentColor" />
    </svg>
  );
}

export function TiktokIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M9 2v7.2a2.3 2.3 0 11-1.8-2.25M9 2c.3 1.5 1.4 2.6 2.9 2.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QuestionIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M6.15 6.3c0-1.05.8-1.75 1.85-1.75s1.85.65 1.85 1.6c0 .95-.65 1.25-1.25 1.65-.5.32-.75.62-.75 1.1"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.15" r="0.5" fill="currentColor" />
    </svg>
  );
}

export function GridIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function GearIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.4" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M8 1.6v1.6M8 12.8v1.6M14.4 8h-1.6M3.2 8H1.6M12.35 3.65l-1.13 1.13M4.78 11.17l-1.13 1.13M12.35 12.35l-1.13-1.13M4.78 4.83L3.65 3.65"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PersonIcon({className}: IconProps) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="8" cy="5.7" r="1.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M4.8 11.6c.6-1.75 1.8-2.7 3.2-2.7s2.6.95 3.2 2.7" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
