import React, { useState } from 'react';

export const PaymentTestCard: React.FC = () => {
  const [testName, setTestName] = useState('John Doe');
  const [testPhone, setTestPhone] = useState('254708374149');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const testMpesaPayment = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('https://atara-dajy.onrender.com/mpesa/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: testPhone,
          amount: 500,
          account_reference: testName,
          transaction_desc: 'Test Fitness Session Payment',
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.ResponseCode === '0') {
          setResult(`✅ STK Push sent successfully!\nCheckout ID: ${data.CheckoutRequestID}`);
        } else {
          setResult(`❌ STK Push failed: ${data.errorMessage || 'Unknown error'}`);
        }
      } else {
        setResult(`❌ Request failed: ${data.message || 'Server error'}`);
      }
    } catch (error: any) {
      setResult(`❌ Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>🧪 Test M-Pesa Payment</h3>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>
          Customer Name
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>
          Phone Number
        </label>
        <input
          type="text"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
        />
      </div>

      <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#E3F2FD', borderRadius: 4 }}>
        <div style={{ fontSize: 12, color: '#1565C0', fontWeight: 'bold', marginBottom: 4 }}>
          Test Details:
        </div>
        <div style={{ fontSize: 11, color: '#666' }}>
          • Paybill: 4188419<br/>
          • Account: {testName}<br/>
          • Amount: KES 500<br/>
          • Phone: {testPhone}
        </div>
      </div>

      <button
        onClick={testMpesaPayment}
        disabled={loading || !testName || !testPhone}
        style={{
          width: '100%',
          backgroundColor: loading ? '#ccc' : '#2E7D32',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        {loading ? '⏳ Testing...' : '📱 Test M-Pesa STK Push'}
      </button>

      {result && (
        <div style={{ 
          padding: 12, 
          backgroundColor: result.includes('✅') ? '#E8F5E9' : '#FFEBEE',
          color: result.includes('✅') ? '#2E7D32' : '#C62828',
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: 'pre-line',
        }}>
          {result}
        </div>
      )}
    </div>
  );
};