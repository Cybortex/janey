// Line-art lotus divider (echoes the logo). Draws itself on load.
export default function Divider() {
  return (
    <svg className="draw mx-auto text-gold" width="320" height="40" viewBox="0 0 320 40" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M0 20H130" /><path d="M190 20H320" />
      <path d="M160 6c-8 6-8 20 0 26 8-6 8-20 0-26Z" />
      <path d="M160 32c-10-2-18-10-18-18 8 0 16 8 18 18Zm0 0c10-2 18-10 18-18-8 0-16 8-18 18Z" />
    </svg>
  );
}
