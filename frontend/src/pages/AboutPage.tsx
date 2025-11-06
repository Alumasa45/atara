import NavigationHeader from '../components/NavigationHeader';

export default function AboutPage() {
  return (
    <div>
      <NavigationHeader />
      <div
        style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}
      >
        <h1 style={{ fontSize: '36px', marginBottom: '16px' }}>About Us</h1>
        <p style={{ fontSize: '16px', lineHeight: 1.6, color: '#666' }}>
          Welcome to Atara Movement Studio! We are dedicated to helping you
          achieve your fitness goals in a supportive and motivating environment.
        </p>
        <p
          style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#666',
            marginTop: '16px',
          }}
        >
          Our team of experienced trainers is committed to providing
          personalized fitness programs tailored to your individual needs.
        </p>
      </div>
    </div>
  );
}
