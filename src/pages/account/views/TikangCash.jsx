import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal';

const TikangCash = () => {
  const { user } = useAuth();
  const [cash, setCash] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);

  const fetchCash = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_CASH}/${user.user_id}`);
      const data = await res.json();
      setCash(data.tikang_cash ?? 0); // Ensure fallback to 0
    } catch (error) {
      console.error('Failed to fetch tikang cash:', error);
    }
  };

  const handleTransaction = async () => {
    try {
      const updatedAmount = transactionType === 'Deposit'
        ? Number(cash) + parseFloat(amount)
        : Number(cash) - parseFloat(amount);

      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/cash/${user.user_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tikang_cash: updatedAmount }),
      });

      if (res.ok) {
        setCash(updatedAmount);
        setHistory(prev => [
          {
            type: transactionType,
            amount: parseFloat(amount),
            date: new Date().toLocaleString(),
          },
          ...prev,
        ]);
        setModalOpen(false);
        setAmount('');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  useEffect(() => {
    if (user?.user_id) fetchCash();
  }, [user]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(val ?? 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold mb-4">Tikang Cash Balance</h1>

      {/* Balance Card */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-6">
        <p className="text-lg">
          Hello, <span className="font-semibold">{user?.full_name}</span>
        </p>
        <p className="text-xl mt-2">
          Current Balance:
          <span className="font-bold text-green-600 ml-2">
            {formatCurrency(cash)}
          </span>
        </p>

        <div className="mt-4 flex gap-4">
          <button
            onClick={() => { setModalOpen(true); setTransactionType('Deposit'); }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl"
          >
            Deposit
          </button>
          <button
            onClick={() => { setModalOpen(true); setTransactionType('Withdraw'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y">
            {history.map((entry, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{entry.type}</span>
                <span>{formatCurrency(entry.amount)}</span>
                <span className="text-sm text-gray-500">{entry.date}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h3 className="text-xl font-bold mb-4">{transactionType} Tikang Cash</h3>
          <input
            type="number"
            placeholder="Enter amount"
            className="border rounded w-full p-2 mb-4"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
            <button onClick={handleTransaction} className="px-4 py-2 bg-blue-500 text-white rounded">
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TikangCash;
