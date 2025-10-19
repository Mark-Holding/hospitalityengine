'use client';

import { useState } from 'react';

export default function BillingSettings() {
  const [currentPlan] = useState({
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Up to 50 staff members',
      'Advanced analytics',
      'Inventory management',
      'Compliance tools',
      'Priority support',
    ],
  });

  const [paymentMethods] = useState([
    { id: 1, type: 'card', last4: '4242', brand: 'Visa', expiry: '12/25', isDefault: true },
    { id: 2, type: 'card', last4: '5555', brand: 'Mastercard', expiry: '08/24', isDefault: false },
  ]);

  const [invoices] = useState([
    { id: 'INV-001', date: '2024-01-01', amount: 99, status: 'paid', pdf: '#' },
    { id: 'INV-002', date: '2023-12-01', amount: 99, status: 'paid', pdf: '#' },
    { id: 'INV-003', date: '2023-11-01', amount: 99, status: 'paid', pdf: '#' },
  ]);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your subscription and billing</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            Active
          </span>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">${currentPlan.price}</span>
            <span className="text-gray-600">/ {currentPlan.interval}</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{currentPlan.name}</h3>
          <ul className="space-y-2">
            {currentPlan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-blue-600 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Upgrade Plan
          </button>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your payment methods</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Add Payment Method
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  {method.brand}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {method.brand} ending in {method.last4}
                  </p>
                  <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                </div>
                {method.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!method.isDefault && (
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Set as Default
                  </button>
                )}
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(invoice.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">${invoice.amount}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {invoice.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={invoice.pdf}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Download PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current Usage</h2>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Staff Members</span>
              <span className="text-sm text-gray-600">24 / 50</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '48%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm text-gray-600">1.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Calls (This Month)</span>
              <span className="text-sm text-gray-600">4,521 / 100,000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '4.5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
