import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Breadcrumbs.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import AppCard from '../../components/AppCard.jsx';
import KpiCard from '../../components/KpiCard.jsx';
import LineChart from '../../components/charts/LineChart.jsx';
import BarChart from '../../components/charts/BarChart.jsx';
import DonutChart from '../../components/charts/DonutChart.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { exportCsv, money } from '../../lib/format.js';
import { localStorageStore } from '../../data-access/localStorageStore.js';
import { brand } from '../../lib/brand.js';

/**
 * Dashboard — replaces dashboard.html (PPT slide 5).
 * KPIs: Total Products / Inventory Units / Inventory Value / Orders / Low Stock.
 * 3 canvas charts: Monthly Sales Revenue (line), Sales by Category (bar),
 * Inventory Distribution (donut). Recent orders table.
 */
export default function Dashboard() {
  const recent = localStorageStore.getOrders().slice(0, 4);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', to: '/dashboard' }, { label: 'Dashboard' }]} />
      <PageHeader
        title="Dashboard"
        subtitle="Wednesday, 7 January 2026 · data refreshed 4 min ago"
      >
        <button
          className="btn btn-outline-app"
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            exportCsv(
              `dashboard-${today}.csv`,
              recent.map((o) => ({
                order: o.order,
                school: o.school,
                total: o.total.toFixed(2),
                status: o.status,
              })),
            );
          }}
        >
          Export
        </button>
        <Link to="/orders/new" className="btn btn-primary-app">
          + New Order
        </Link>
      </PageHeader>

      <div className="dashboard-kpis mb-3">
        <KpiCard label="Total Products" value="245" trend="+6 this month" />
        <KpiCard label="Inventory Units" value="18,450" trend="+2.4% vs Dec" variant="teal" />
        <KpiCard label="Inventory Value" value="$42,850" trend="+$1,910" variant="mint" />
        <KpiCard label="Orders This Month" value="286" trend="+18 vs Dec" />
        <KpiCard
          label="Low Stock Items"
          value="18"
          trend="4 need action"
          trendColor={brand.warning}
          variant="amber"
        />
      </div>

      <div className="row g-3 mb-3">
        <div className="col-xl-8">
          <AppCard
            head={
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="mb-0">Monthly Sales Revenue</h5>
                  <div className="small-note">Jan – Dec 2025 · USD</div>
                </div>
                <Link to="/reports">View report</Link>
              </div>
            }
            body={<LineChart id="salesLine" alt="Monthly sales revenue across the year" values={[12800, 13500, 15000, 13100, 15400, 12200, 9800, 16900, 21800, 18700, 16900, 19400]} labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']} />}
          />
        </div>
        <div className="col-xl-4">
          <AppCard
            head={<h5>Sales by Product Category</h5>}
            body={<BarChart id="categoryBar" alt="Top product categories by units sold" values={[7420, 3880, 2650, 2410, 2280]} labels={['Books', 'Puzzles', 'Alpha Cards', 'Game Cards', 'Copybooks']} />}
          />
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-4">
          <AppCard
            head={<h5>Inventory Distribution</h5>}
            body={<DonutChart id="inventoryDonut" alt="Inventory share by category" values={[34, 17, 16, 14, 19]} labels={['Books', 'Puzzles', 'Alphabet Cards', 'Game Cards', 'Copybooks']} />}
          />
        </div>
        <div className="col-xl-8">
          <AppCard
            head={
              <div className="d-flex justify-content-between">
                <h5>Recent School Orders</h5>
                <Link to="/orders">View all</Link>
              </div>
            }
            body={
              <div className="table-responsive">
                <table className="table table-app">
                  <thead>
                    <tr>
                      <th scope="col">Order</th>
                      <th scope="col">School</th>
                      <th scope="col" className="text-end">Total</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((o) => (
                      <tr key={o.order}>
                        <td className="sku">{o.order}</td>
                        <td>{o.school}</td>
                        <td className="numeric">{money(o.total)}</td>
                        <td>
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}
