import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import WarningPopup from '../../../components/WarningPopup';
import LoadingSpinner from '../../../components/LoadingSpinner';
import callingCodes from '../../../data/calling-codes.json';
import emailjs from '@emailjs/browser';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function MyAccount() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [emailInput, setEmailInput] = useState('');
  const [emailChanged, setEmailChanged] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerify, setEmailVerify] = useState('');

  const [callingCode, setCallingCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [warning, setWarning] = useState('');
  const [warningType, setWarningType] = useState('error');  
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const API_URL = process.env.REACT_APP_API_URL_GUEST;

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const token = localStorage.getItem('tikangToken');
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updated = await res.json();
        if (updated?.user) {
          setUser(updated.user);
          setFirstName(updated.user.first_name || '');
          setLastName(updated.user.last_name || '');
          setEmailInput(updated.user.email || '');
          setEmailVerify(updated.user.email_verify || '');
          setEmailChanged(false); // reset on load

          if (updated.user.phone) {
            const match = callingCodes.find((c) =>
              updated.user.phone.startsWith(c.code)
            );
            if (match) {
              setCallingCode(match.code);
              setPhoneNumber(updated.user.phone.replace(match.code, '').trim());
            } else {
              setPhoneNumber(updated.user.phone);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUser(); // run once on mount
  }, [API_URL, setUser]);

  const handleNameSave = async (e) => {
    e.preventDefault();
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      setWarning('Names should not contain numbers or special characters.');
      setWarningType('error');
      return;
    }

    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL}/update-name`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name: firstName.trim(), last_name: lastName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const refreshed = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = await refreshed.json();
      if (updated?.user) setUser(updated.user);

      setEditingName(false);
      setWarning('Name updated successfully!');
      setWarningType('success');
    } catch (err) {
      setWarning(err.message || 'Failed to update name.');
      setWarningType('error');
    }
  };

  const sendVerificationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    const templateParams = {
      email: emailInput,
      passcode: code,
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY
      )
      .then(() => {
        setCodeSent(true);
        setWarning('Verification code sent!');
        setWarningType('success');
      })
      .catch((err) => {
        console.error('EmailJS error:', err);
        setWarning('Failed to send verification email.');
        setWarningType('error');
      });
  };

  const handleEmailUpdate = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setWarning('Please enter a valid email address.');
      setWarningType('error');
      return;
    }

    if (emailChanged && verificationCode !== generatedCode) {
      setWarning('Invalid verification code.');
      setWarningType('error');
      return;
    }

    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL}/update-email`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: emailInput }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const refreshed = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = await refreshed.json();
      if (updated?.user) {
        setUser(updated.user);
        setEmailVerify(updated.user.email_verify || '');
      }

      setEditingEmail(false);
      setCodeSent(false);
      setVerificationCode('');
      setGeneratedCode('');
      setEmailChanged(false);
      setWarning('Email updated successfully!');
      setWarningType('success');
    } catch (err) {
      setWarning(err.message || 'Failed to update email.');
      setWarningType('error');
    }
  };

  const handlePhoneUpdate = async () => {
    if (!/^\d{10}$/.test(phoneNumber)) {
      setWarning('Phone number must be exactly 10 digits.');
      setWarningType('error');
      return;
    }

    if (!callingCode) {
      setWarning('Please select a country calling code.');
      setWarningType('error');
      return;
    }

    const fullPhone = `${callingCode}${phoneNumber}`;
    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL}/update-phone`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const refreshed = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updated = await refreshed.json();
      if (updated?.user) setUser(updated.user);

      setEditingPhone(false);
      setWarning('Phone number updated successfully!');
      setWarningType('success');
    } catch (err) {
      setWarning(err.message || 'Failed to update phone number.');
      setWarningType('error');
    }
  };

  const handlePasswordUpdate = async () => {
    if (getPasswordStrength(newPassword) !== 'strong') {
      setWarning('Password must be at least 8 characters, include a number and a special character.');
      setWarningType('error');
      return;
    }
  
    if (newPassword !== confirmPassword) {
      setWarning('Passwords do not match.');
      setWarningType('error');
      return;
    }
  
    try {
      const token = localStorage.getItem('tikangToken');
      const res = await fetch(`${API_URL}/update-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword, confirmPassword }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
  
      setEditingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setWarning('Password updated successfully!');
      setWarningType('success');
    } catch (err) {
      setWarning(err.message || 'Failed to update password.');
      setWarningType('error');
    }
  };

  const getPasswordStrength = (password) => {
    const strongRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return strongRegex.test(password) ? 'strong' : 'weak';
  };

  if (loading || !user) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      {warning && (
        <WarningPopup message={warning} type={warningType} onClose={() => setWarning('')} />
      )}
    <h1 className="text-2xl font-bold text-gray-800 mb-6">My Account</h1>

      {/* Name Card */}
      <div className={`mb-6 rounded-lg shadow ${editingName ? 'bg-white p-6' : 'bg-gradient-to-r from-blue-400 to-blue-200 p-5 text-white'}`}>
        {editingName ? (
          <form className="space-y-4" onSubmit={handleNameSave}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First name</label>
              <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
              <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="button" onClick={() => setEditingName(false)} className="text-blue-500 hover:underline">Cancel</button>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded">Save</button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium uppercase">Name</p>
              <p className="text-lg font-bold">{user?.full_name}</p>
            </div>
            <button onClick={() => setEditingName(true)} className="text-white hover:underline text-sm font-medium">Edit</button>
          </div>
        )}
      </div>
      {/* Email */}
      <div className="mb-6 bg-white rounded-lg shadow p-5">
        <p className="text-sm font-medium text-gray-500">Email</p>

        {editingEmail ? (
          <div className="space-y-3">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setEmailChanged(true);
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {emailChanged && (
              <>
                {!codeSent ? (
                  <button
                    onClick={sendVerificationCode}
                    className="text-sm text-blue-600 hover:underline font-medium"
                  >
                    Send Code
                  </button>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setEditingEmail(false);
                  setCodeSent(false);
                  setVerificationCode('');
                  setGeneratedCode('');
                  setEmailChanged(false);
                }}
                className="text-blue-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
            <span className="text-gray-800">{user?.email}</span>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full text-center ${
                  emailVerify === 'yes' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {emailVerify === 'yes' ? 'VERIFIED' : 'UNVERIFIED'}
              </span>
              <button
                onClick={() => {
                  setEditingEmail(true);
                  setEmailChanged(false);
                  setCodeSent(false);
                  setVerificationCode('');
                  setGeneratedCode('');
                }}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Phone */}
      <div className="mb-6 lg-white rounded-lg shadow p-5">
        <p className="text-sm font-medium text-gray-500 mb-2">Phone number</p>
        {editingPhone ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calling Code</label>
              <select value={callingCode} onChange={(e) => setCallingCode(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="">-- Select Country Code --</option>
                {callingCodes.map((entry) => (
                  <option key={entry.code} value={entry.code}>
                    {entry.label} ({entry.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input type="tel" value={phoneNumber} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setPhoneNumber(val);
              }} className="w-full border border-gray-300 rounded px-3 py-2" maxLength={10} inputMode="numeric" />
            </div>
            <div className="flex gap-4 pt-1">
              <button type="button" onClick={() => setEditingPhone(false)} className="text-blue-500 hover:underline">Cancel</button>
              <button type="button" onClick={handlePhoneUpdate} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded">Continue</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-gray-700">{user?.phone || '—'}</p>
            <button onClick={() => setEditingPhone(true)} className="text-blue-600 hover:underline text-sm font-medium">{user?.phone ? 'Edit' : 'Add'}</button>
          </div>
        )}
      </div>

        {/* Password */}
        <div className="mb-6 bg-white rounded-lg shadow p-5">
          <p className="text-sm font-medium text-gray-500">Password</p>
          {editingPassword ? (
            <div className="space-y-3 mt-2">
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPassword(val);
                      setPasswordStrength(getPasswordStrength(val));
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {newPassword && (
                  <p
                    className={`text-xs mt-1 font-medium ${
                      passwordStrength === 'strong' ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    {passwordStrength === 'strong'
                      ? 'Strong password'
                      : 'Weak: use at least 8 characters, a number and a special character'}
                  </p>
                )}
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => {
                    setEditingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mt-1">
              <p className="text-gray-700">••••••••••••</p>
              <button
                onClick={() => setEditingPassword(true)}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                Edit
              </button>
            </div>
          )}
        </div>
    </div>
  );
}
