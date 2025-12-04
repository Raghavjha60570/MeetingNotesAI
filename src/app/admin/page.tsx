'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [email, setEmail] = useState('admin@gmail.com')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const confirmUser = async () => {
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/admin/confirm-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Success: ${data.message}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Admin - Confirm User</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <button
            onClick={confirmUser}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Confirming...' : 'Confirm User Email'}
          </button>

          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Note:</strong> This page confirms user emails so they can sign in. After confirming admin@gmail.com, you can sign in with:</p>
          <p className="mt-2"><strong>Email:</strong> admin@gmail.com</p>
          <p><strong>Password:</strong> admin1234</p>
        </div>
      </div>
    </div>
  )
}
