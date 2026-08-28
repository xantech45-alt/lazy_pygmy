/**
 * canonicalDataTable — converts a chart's raw (labels, values) series into
 * the four fields a screen-reader needs:
 *
 *   label   — concise aria-label for role="img" on the canvas
 *   caption — long-form description for the <figcaption> and <caption>
 *   headers — array of column headings for the fallback <table>
 *   rows    — array of [string, ...] rows for the fallback <table>
 *
 * Audit fix #30: every chart component now renders a visually-hidden
 * <table> of the underlying data so screen readers can read the points
 * instead of treating the canvas as an opaque image.
 */
export function canonicalDataTable({ alt, labels = [], values = [], kind = 'line' }) {
  const title = alt || `Chart with ${labels.length} data points`;
  const unit = kind === 'donut' ? 'share' : 'value';
  const total = values.reduce((a, b) => a + (Number(b) || 0), 0);
  const peakIdx = values.reduce((best, v, i) => (v > values[best] ? i : best), 0);

  const label = `${title}. Peak: ${labels[peakIdx] || 'n/a'} at ${values[peakIdx] || 0}.`;

  const caption =
    kind === 'donut'
      ? `${title}. Total: ${total}. Composition: ${labels
          .map((l, i) => `${l} ${values[i] || 0}`)
          .join(', ')}.`
      : `${title}. Total: ${total}. Labels: ${labels.join(', ')}. Values: ${values.join(', ')}.`;

  const headers = kind === 'donut' ? ['Slice', 'Value', 'Share'] : ['Label', 'Value'];

  const rows =
    kind === 'donut'
      ? labels.map((l, i) => {
          const v = values[i] || 0;
          return [l, v, total > 0 ? `${Math.round((v / total) * 100)}%` : '0%'];
        })
      : labels.map((l, i) => [l, values[i] || 0]);

  return { label, caption, headers, rows };
}
