import React, { useState } from 'react';
import { MpesaPayment } from './MpesaPayment';

export const PaymentTestCard: React.FC = () => {
  const [showMpesa, setShowMpesa] = useState(false);
  const [testName, setTestName] = useState('John Doe');

  return (
    <div className="card">
      <h3>🧪 Test M-Pesa Payment</h3>
      
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 12 }}>
          Test Customer Name
        </label>
        <input
          type="text"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
          placeholder="Enter customer name"
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
          • Use sandbox phone: 254708374149
        </div>
      </div>

      <button
        onClick={() => setShowMpesa(!showMpesa)}
        style={{
          width: '100%',
          backgroundColor: showMpesa ? '#f44336' : '#2E7D32',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '10px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        {showMpesa ? '❌ Close Test' : '📱 Test M-Pesa Payment'}
      </button>

      {showMpesa && (
        <MpesaPayment
          amount={500}
          accountReference={testName}
          description="Test Fitness Session Payment"
          onSuccess={(receiptNumber) => {
            alert(`✅ Payment Success!\nReceipt: ${receiptNumber}`);
            setShowMpesa(false);
          }}
          onError={(error) => {
            alert(`❌ Payment Failed!\nError: ${error}`);
          }}
        />
      )}
    </div>
  );
};