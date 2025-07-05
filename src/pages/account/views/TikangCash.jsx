import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Modal from '../../../components/Modal';
import WarningPopup from '../../../components/WarningPopup';

const TikangCash = () => {
  const { fetchUser } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [cash, setCash] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [adminQR, setAdminQR] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [walletHistory, setWalletHistory] = useState([]);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const init = async () => {
      const user = await fetchUser();
      if (user) setCurrentUser(user);
    };
    init();
  }, [fetchUser]);

  const fetchCash = useCallback(async () => {
    if (!currentUser?.user_id) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_CASH}/${currentUser.user_id}`);
      const data = await res.json();
      setCash(data.tikang_cash ?? 0);
    } catch (error) {
      console.error('Failed to fetch tikang cash:', error);
    }
  }, [currentUser]);

  const fetchWalletTransactions = useCallback(async () => {
    if (!currentUser?.user_id) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/wallet-transactions/${currentUser.user_id}`);
      const data = await res.json();
      setWalletHistory(Array.isArray(data.transactions) ? data.transactions : []);
    } catch (err) {
      console.error('Failed to fetch wallet history:', err);
      setWalletHistory([]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.user_id) {
      fetchCash();
      fetchWalletTransactions();
    }
  }, [currentUser, fetchCash, fetchWalletTransactions]);

  useEffect(() => {
    const fetchQR = async () => {
      if (transactionType === 'Deposit') {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/admin-gcash-qr`);
          const data = await res.json();
          setAdminQR(data.gcash_qr);
        } catch (err) {
          console.error('Failed to fetch admin QR:', err);
        }
      }
    };
    fetchQR();
  }, [transactionType]);

  const showPopup = (message, type = 'info') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: '', type: 'info' }), 3000);
  };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    const token = localStorage.getItem('tikangToken');

    if (!amount || isNaN(num) || num <= 0) return showPopup('Enter a valid amount', 'warning');
    if (transactionType === 'Deposit' && (num < 50 || num > 100000)) {
      return showPopup('Deposit must be between ₱50 and ₱100,000', 'warning');
    }
    if (transactionType === 'Withdraw' && num > cash) {
      return showPopup('Cannot withdraw more than your balance', 'warning');
    }

    try {
      let res;
      if (transactionType === 'Deposit') {
        if (!receipt) return showPopup('Please upload a GCash receipt.', 'warning');
        const formData = new FormData();
        formData.append('amount', num);
        formData.append('receipt', receipt);

        res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/deposit`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${process.env.REACT_APP_API_URL_GUEST}/withdraw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ amount: num }),
        });
      }

      const data = await res.json();

      if (res.ok) {
        showPopup(`${transactionType} request submitted!`, 'success');
        setModalOpen(false);
        setAmount('');
        setReceipt(null);
        fetchCash();
        fetchWalletTransactions();
      } else {
        showPopup(data.message || 'Transaction failed.', 'danger');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      showPopup('An error occurred. Please try again.', 'danger');
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val ?? 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {popup.show && <WarningPopup message={popup.message} type={popup.type} />}

      <h1 className="text-2xl font-bold mb-4">Tikang Cash Balance</h1>
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <p className="text-lg">Hello, <span className="font-semibold">{currentUser?.full_name}</span></p>
        <p className="text-xl mt-2">
          Current Balance: <span className="font-bold text-green-600">{formatCurrency(cash)}</span>
        </p>
        <div className="mt-4 flex gap-4">
          <button onClick={() => { setModalOpen(true); setTransactionType('Deposit'); }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">Deposit</button>
          <button onClick={() => { setModalOpen(true); setTransactionType('Withdraw'); }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">Withdraw</button>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">Wallet Transaction History</h2>
        {walletHistory.length === 0 ? (
          <p className="text-gray-500">No wallet transactions yet.</p>
        ) : (
          <table className="w-full text-sm text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Method</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {walletHistory.map((t, idx) => (
                <tr key={idx}>
                  <td className="p-2 border capitalize">{t.type}</td>
                  <td className="p-2 border">{formatCurrency(t.amount)}</td>
                  <td className="p-2 border">{t.status}</td>
                  <td className="p-2 border">{t.method}</td>
                  <td className="p-2 border">{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <div className="space-y-5 max-w-md w-full px-4 py-6 text-gray-800">
            <h3 className="text-xl font-bold text-center">{transactionType} Tikang Cash</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium">Enter Amount</label>
              <input
                type="number"
                placeholder="e.g. 500"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {transactionType === 'Deposit' && (
              <>
                <p className="text-red-500 text-sm">Minimum deposit ₱50 – Maximum ₱100,000</p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload GCash Receipt</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setReceipt(e.target.files[0])}
                    className="w-full"
                  />
                </div>
                {adminQR && (
                  <div className="pt-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Admin GCash QR</p>
                    <p className="text-xs text-gray-500 italic mb-2">Click image to zoom</p>
                    <img
                      src={`${process.env.REACT_APP_API_URL}${adminQR}`}
                      alt="Admin GCash QR"
                      className="w-48 h-48 object-contain border rounded-lg shadow mx-auto cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setZoomed(true)}
                    />
                  </div>
                )}
              </>
            )}

            {transactionType === 'Withdraw' && (
              <p className="text-sm text-red-500">
                Maximum amount you can withdraw: <strong>{formatCurrency(cash)}</strong>
              </p>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-md">
                Cancel
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Submit
              </button>
            </div>
          </div>

          {zoomed && (
            <div
              className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
              onClick={() => setZoomed(false)}
            >
              <img
                src={`${process.env.REACT_APP_API_URL}${adminQR}`}
                alt="Zoomed QR"
                className="w-auto max-w-[90%] max-h-[90%] border-4 border-white rounded-lg shadow-2xl"
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default TikangCash;
