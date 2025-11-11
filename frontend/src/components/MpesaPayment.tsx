import React, { useState } from 'react';

interface MpesaPaymentProps {
  amount: number;
  accountReference: string;
  description: string;
  onSuccess: (receiptNumber: string) => void;
  onError: (error: string) => void;
}

export const MpesaPayment: React.FC<MpesaPaymentProps> = ({
  amount,
  accountReference,
  description,
  onSuccess,
  onError,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState('');

  const formatPhoneNumber = (phone: string): string => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Convert to 254 format
    if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254' + cleaned;
    }
    
    return cleaned;
  };

  const initiatePayment = async () => {
    if (!phoneNumber) {
      onError('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      const response = await fetch('https://atara-dajy.onrender.com/mpesa/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          amount: amount,
          account_reference: accountReference,
          transaction_desc: description,
        }),
      });

      const result = await response.json();

      if (result.ResponseCode === '0') {
        setCheckoutRequestId(result.CheckoutRequestID);
        // Start polling for payment status
        pollPaymentStatus(result.CheckoutRequestID);
      } else {
        onError(result.errorMessage || 'Payment initiation failed');
      }
    } catch (error: any) {
      onError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (requestId: string) => {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`https://atara-dajy.onrender.com/mpesa/status/${requestId}`);
        const transaction = await response.json();

        if (transaction && transaction.status !== 'pending') {
          if (transaction.status === 'completed') {
            onSuccess(transaction.mpesa_receipt_number);
          } else {
            onError(transaction.result_desc || 'Payment failed');
          }
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          onError('Payment timeout. Please try again.');
        }
      } catch (error) {
        onError('Failed to check payment status');
      }
    };

    poll();
  };

  return (
    <div style={{ padding: 20, border: '1px solid #ddd', borderRadius: 8, backgroundColor: '#f9f9f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 24, marginRight: 8 }}>📱</div>
        <h3 style={{ margin: 0, color: '#2E7D32' }}>Pay with M-Pesa</h3>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          <strong>Paybill:</strong> 4188419
        </div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          <strong>Account:</strong> {accountReference}
        </div>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          <strong>Amount:</strong> KES {amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 'bold', fontSize: 14 }}>
          Phone Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0712345678 or 254712345678"
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            fontSize: 14,
          }}
          disabled={loading}
        />
      </div>

      <button
        onClick={initiatePayment}
        disabled={loading || !phoneNumber}
        style={{
          width: '100%',
          backgroundColor: loading ? '#ccc' : '#2E7D32',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          padding: '12px',
          fontSize: 16,
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '⏳ Processing...' : '💳 Pay Now'}
      </button>

      {checkoutRequestId && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#E8F5E9', borderRadius: 4 }}>
          <div style={{ fontSize: 14, color: '#2E7D32', fontWeight: 'bold' }}>
            📱 Check your phone for M-Pesa prompt
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Enter your M-Pesa PIN to complete the payment
          </div>
        </div>
      )}
    </div>
  );
};