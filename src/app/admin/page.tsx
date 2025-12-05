'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
}

export default function AdminPage() {
  const [email, setEmail] = useState('admin@gmail.com')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const confirmUser = async (userEmail?: string) => {
    const targetEmail = userEmail || email
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/admin/confirm-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: targetEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Success: ${data.message}`)
        // Refresh users list
        loadUsers()
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/list-users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-center mb-2">Admin Panel</h1>
          <p className="text-center text-gray-600">Manage user accounts and confirmations</p>
        </div>

        {/* Quick Confirm */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick User Confirmation</h2>

          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex items-end">
              <button
                onClick={() => confirmUser()}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Confirming...' : 'Confirm User'}
              </button>
            </div>
          </div>

          {result && (
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All Users</h2>
            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              {loadingUsers ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Created</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{user.email}</td>
                    <td className="py-3">
                      {user.email_confirmed_at ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          Confirmed
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          Unconfirmed
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      {!user.email_confirmed_at && (
                        <button
                          onClick={() => confirmUser(user.email)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loadingUsers && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Testing Instructions</h3>
          <div className="space-y-2 text-blue-800">
            <p><strong>1.</strong> Create a new account at <code className="bg-blue-100 px-1 rounded">/auth/signup</code></p>
            <p><strong>2.</strong> Come back here and confirm the user email</p>
            <p><strong>3.</strong> Go to <code className="bg-blue-100 px-1 rounded">/auth/signin</code> and login</p>
            <p><strong>4.</strong> You should be redirected to the dashboard!</p>
          </div>

          <div className="mt-4 p-3 bg-white rounded border">
            <p className="font-medium text-gray-900">Test Account:</p>
            <p><strong>Email:</strong> admin@gmail.com</p>
            <p><strong>Password:</strong> admin1234</p>
          </div>
        </div>
      </div>
    </div>
  )
}


