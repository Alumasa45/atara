import NavigationHeader from '../components/NavigationHeader';

export default function ContactPage() {
  return (
    <div>
      <NavigationHeader />
      <div
        style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}
      >
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>Contact Us</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666' }}>
          Get in touch with us for any questions or inquiries.
        </p>

        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>
            Contact Information
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666' }}>
            📧 Email: ataradesk25@gmail.com
            <br />
            📞 Phone: +254 700 000 000
            <br />
            📍 Address: Nairobi, Kenya
          </p>
        </div>
      </div>
    </div>
  );
}
