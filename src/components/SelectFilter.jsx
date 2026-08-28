/**
 * SelectFilter — a labelled <select> with an "All" option prepended.
 * Shared between every list page using the standard toolbar.
 */
export default function SelectFilter({ id, value, onChange, label, options }) {
  return (
    <select
      id={id}
      name={id}
      className="form-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={`${label} filter`}
    >
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}
