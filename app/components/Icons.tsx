type IconProps = {className?: string};

export function MenuIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 5.5H18M2 10H18M2 14.5H18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2L16 16M16 2L2 16"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8.5"
        cy="8.5"
        r="6"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M13.2 13.2L17.5 17.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AccountIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="9.5"
        cy="6"
        r="3.4"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M2.7 17c0.9-3.6 3.9-5.8 6.8-5.8s5.9 2.2 6.8 5.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BagIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.5 6.5H14.5L14 17H5L4.5 6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 6.2V5.2C7 3.5 8.3 2 9.5 2C10.7 2 12 3.5 12 5.2V6.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 8H14M14 8L9 3M14 8L9 13"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 1V11M1 6H11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MinusIcon({className}: IconProps) {
  return (
    <svg
      className={className}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 6H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function TruckIcon({className}: IconProps) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M2 6.5H15V17H2V6.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M15 10H19.5L23 13.5V17H15V10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="7" cy="19.5" r="2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="19" cy="19.5" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function HeadsetIcon({className}: IconProps) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path d="M4 14V12C4 7 8 3.5 13 3.5S22 7 22 12V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <rect x="2.5" y="13.5" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="18.5" y="13.5" width="5" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M22 20.5C22 22.4 20.4 24 18.5 24H16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon({className}: IconProps) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect x="5" y="11.5" width="16" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.5 11.5V8C8.5 5.5 10.5 3.5 13 3.5S17.5 5.5 17.5 8V11.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="17" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function ReturnIcon({className}: IconProps) {
  return (
    <svg className={className} width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M5 9C6.6 5.9 9.6 3.8 13.1 3.8C18 3.8 22 7.7 22 12.6C22 17.5 18 21.4 13.1 21.4C9 21.4 5.5 18.6 4.4 14.8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path d="M5 4.5V9.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
