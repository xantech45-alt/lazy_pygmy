/**
 * print.js — tiny wrapper around window.print() that defers until the next
 * paint so any state-driven DOM changes have settled, and that adds the
 * `data-printing` attribute on <body> for the @media print rules in
 * `print.css` to hide chrome (sidebar, topbar, footer, buttons, filters).
 */
export function printPage({ title } = {}) {
  if (typeof document === 'undefined') return;
  if (title && document.title !== title) {
    const prev = document.title;
    document.title = title;
    // restore after the print dialog closes
    const restore = () => {
      document.title = prev;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
  }
  document.body.setAttribute('data-printing', 'true');
  // remove after print completes (or shortly after if user cancels)
  const cleanup = () => {
    document.body.removeAttribute('data-printing');
    window.removeEventListener('afterprint', cleanup);
  };
  window.addEventListener('afterprint', cleanup);
  // give the DOM a tick to settle
  setTimeout(() => window.print(), 50);
}
