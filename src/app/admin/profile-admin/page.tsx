'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Company = {
  name: string
  email: string
  head_office_phone: string
  head_office_phone_backup: string
  head_office_address: string
  description: string
}

export default function AdminProfile() {
  const [company, setCompany] = useState<Company | null>(null)
  const router = useRouter()

  const payments = [
    {
      id: 1,
      orderDate: '2025-05-01',
      package: 'Pro',
      period: '6 months',
      total: 'Rp 3.600.000',
      status: 'Unpaid',
    },
    {
      id: 2,
      orderDate: '2025-04-05',
      package: 'Starter',
      period: '1 month',
      total: 'Rp 500.000',
      status: 'Paid',
    },
    {
      id: 3,
      orderDate: '2025-02-01',
      package: 'Free Trial',
      period: '1 month',
      total: 'Rp 0',
      status: 'Paid',
    },
  ];

  useEffect(() => {
    fetch('http://localhost:8000/api/companies/1')
      .then(res => res.json())
      .then(data => setCompany(data))
      .catch(error => {
        console.error('Failed to fetch company:', error)
      })
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10 text-neutral-700 font-sans">
      {/* Admin Section */}
      <div>
        <h1 className="text-4xl font-bold mb-1">Admin Profile</h1>
        <p className="text-base text-neutral-500">Details about your subscription and company</p>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-3">Subscription Details</h2>
        <p className="text-sm text-neutral-500 mb-1">Current Package:</p>
        <p className="font-semibold text-blue-600 text-lg mb-2">Starter</p>
        <p className="text-sm text-neutral-600 mb-4">
          Make the most out of your HRIS experience — choose a package that gives your company room to grow.
        </p>
        <button
          onClick={() => router.push('/package-plans')}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Change Package
        </button>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-neutral-100 text-left">
                <th className="p-3 font-medium">No.</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Package</th>
                <th className="p-3 font-medium">Period</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.id} className="even:bg-neutral-50">
                  <td className="p-3">{item.id}</td>
                  <td className="p-3">{item.orderDate}</td>
                  <td className="p-3">{item.package}</td>
                  <td className="p-3">{item.period}</td>
                  <td className="p-3">{item.total}</td>
                  <td className="p-3">
                    <span className={item.status === 'Paid' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {item.status === 'Unpaid' && (
                      <button className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium">
                        Pay
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
        {company ? (
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Name:</span> {company.name}</p>
            <p><span className="font-medium">Email:</span> {company.email}</p>
            <p><span className="font-medium">Phone:</span> {company.head_office_phone}</p>
            <p><span className="font-medium">Backup Phone:</span> {company.head_office_phone_backup}</p>
            <p><span className="font-medium">Address:</span> {company.head_office_address}</p>
            <p><span className="font-medium">Description:</span> {company.description}</p>
          </div>
        ) : (
          <p className="text-neutral-400 text-sm">Company data not loaded yet.</p>
        )}
      </div>
    </div>
  )
}
