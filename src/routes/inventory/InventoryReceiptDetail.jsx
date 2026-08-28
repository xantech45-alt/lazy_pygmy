import { Link, useParams } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { getReceipt, receiptLineTotal, receiptTotals } from '../../data-access/receiptSelectors.js';
import { money, number } from '../../lib/format.js';
import { printPage } from '../../lib/print.js';

/**
 * InventoryReceiptDetail — /inventory/receipts/:receiptId
 *
 * A4 print-friendly view of a single Goods Received Note (GRN).
 * Mirrors the receipts/print.html layout: brand block, GRN header,
 * supplier/PO/date/warehouse/DN metadata, lines table, totals block,
 * and a signature line.
 */
export default function InventoryReceiptDetail() {
  const { receiptId } = useParams();
  const receipt = getReceipt(receiptId);

  const onPrint = () => {
    printPage({ title: `${receipt.id} — Lazy Pygmy Inventory Suite` });
  };

  if (!receipt) {
    return (
      <>
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/dashboard' },
            { label: 'Inventory', to: '/inventory' },
            { label: 'Receipts', to: '/inventory/receipts' },
            { label: 'Not found' },
          ]}
        />
        <PageHeader
          title="Receipt not found"
          subtitle={`No Goods Received Note exists with id "${receiptId}".`}
        >
          <Link to="/inventory/receipts" className="btn btn-primary-app">
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back to receipts
          </Link>
        </PageHeader>
      </>
    );
  }

  const totals = receiptTotals(receipt);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Inventory', to: '/inventory' },
          { label: 'Receipts', to: '/inventory/receipts' },
          { label: receipt.id },
        ]}
      />

      <PageHeader
        title={`Goods Received Note ${receipt.id}`}
        subtitle="Goods booked into the warehouse after supplier delivery"
      >
        <div className="toolbar no-print">
          <button type="button" className="btn btn-outline-app" onClick={onPrint}>
            <i className="bi bi-printer me-1" aria-hidden="true"></i> Print / PDF
          </button>
          <Link to="/inventory/receipts" className="btn btn-outline-app">
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i> Back
          </Link>
        </div>
      </PageHeader>

      <article className="print-card app-card p-4">
        <header className="d-flex flex-wrap justify-content-between align-items-start mb-4 gap-3">
          <div>
            <div className="brand-mark mb-2 print-only" aria-hidden="true">LP</div>
            <div className="fs-5 fw-bold">Lazy Pygmy</div>
            <div className="text-muted-app">Inventory Suite</div>
            <div className="small text-muted-app mt-2">
              Bushrod Island, Monrovia, Montserrado · +231 77 000 0000
            </div>
          </div>
          <div className="text-end">
            <div className="text-uppercase text-muted-app small">Goods Received Note</div>
            <div className="fs-3 fw-bold">{receipt.id}</div>
            <div className="text-muted-app">Issued {receipt.date}</div>
          </div>
        </header>

        <section className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="kv-label">Supplier</div>
            <div className="kv-value">{receipt.supplier}</div>
          </div>
          <div className="col-md-6">
            <div className="kv-label">Purchase Order</div>
            <div className="kv-value">
              <Link to={`/purchase-orders/${receipt.po}`} className="no-print">{receipt.po}</Link>
              <span className="print-only">{receipt.po}</span>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kv-label">Warehouse</div>
            <div className="kv-value">{receipt.warehouse}</div>
          </div>
          <div className="col-md-4">
            <div className="kv-label">Received By</div>
            <div className="kv-value">{receipt.receivedBy}</div>
          </div>
          <div className="col-md-4">
            <div className="kv-label">Delivery Note</div>
            <div className="kv-value">{receipt.deliveryNote}</div>
          </div>
        </section>

        <section className="mb-4">
          <h6 className="text-uppercase text-muted-app small fw-bold mb-2">Lines Received</h6>
          <div className="table-responsive">
            <table className="table table-app table-bordered">
              <thead>
                <tr>
                  <th scope="col">SKU</th>
                  <th scope="col">Product</th>
                  <th scope="col" className="text-end">Qty Ordered</th>
                  <th scope="col" className="text-end">Qty Received</th>
                  <th scope="col" className="text-end">Unit Cost</th>
                  <th scope="col" className="text-end">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.lines.map((l) => (
                  <tr key={l.sku}>
                    <td className="sku">{l.sku}</td>
                    <td>{l.name}</td>
                    <td className="numeric">{number(l.qtyOrdered)}</td>
                    <td className="numeric">{number(l.qtyReceived)}</td>
                    <td className="numeric">{money(l.unitCost)}</td>
                    <td className="numeric">{money(receiptLineTotal(l))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="row g-3 align-items-start mb-4">
          <div className="col-md-7">
            <h6 className="text-uppercase text-muted-app small fw-bold mb-2">Notes</h6>
            <p className="text-muted-app mb-0 small">
              Goods Received Note issued as confirmation that the listed quantities
              were inspected, accepted, and booked into {receipt.warehouse} on{' '}
              {receipt.date}. Any discrepancies must be reported within 48 hours.
            </p>
          </div>
          <div className="col-md-5">
            <table className="table table-sm table-borderless totals-table mb-0">
              <tbody>
                <tr>
                  <th scope="row" className="text-muted-app fw-normal">Line count</th>
                  <td className="text-end">{number(totals.lineCount)}</td>
                </tr>
                <tr>
                  <th scope="row" className="text-muted-app fw-normal">Total units received</th>
                  <td className="text-end">{number(totals.totalUnits)}</td>
                </tr>
                <tr>
                  <th scope="row" className="fw-bold">Total received value</th>
                  <td className="text-end fw-bold">{money(totals.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-5 pt-4 border-top">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="signature-line">
                <div className="signature-name">{receipt.receivedBy}</div>
                <div className="signature-label">Received by (Warehouse)</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="signature-line">
                <div className="signature-name">&nbsp;</div>
                <div className="signature-label">Authorised by (Procurement)</div>
              </div>
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}