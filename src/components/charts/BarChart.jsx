import { useEffect, useRef } from 'react';
import { bars as drawBars } from '../../lib/canvas-charts.js';
import { canonicalDataTable } from './chartA11y.js';

/**
 * BarChart — wraps the canvas drawing algorithm. Audit fix: now exposes
 * role="img" + aria-label on the canvas and a visually-hidden <table>
 * fallback so screen-reader users can read the underlying data points.
 */
export default function BarChart({ id, alt, values, labels }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    drawBars(canvas, values, labels);
    const onResize = () => drawBars(canvas, values, labels);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [values, labels]);

  const { label, caption, headers, rows } = canonicalDataTable({ alt, labels, values, kind: 'bar' });

  return (
    <figure className="chart-box">
      <canvas id={id} ref={ref} role="img" aria-label={label} />
      <figcaption className="visually-hidden">{caption}</figcaption>
      <table className="visually-hidden">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
