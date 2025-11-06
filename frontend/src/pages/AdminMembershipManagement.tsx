import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationHeader from '../components/NavigationHeader';

interface MembershipPlan {
  plan_id: number;
  name: string;
  description: string;
  classes_included: number;
  duration_days: number;
  price: number;
  benefits: string[] | string; // Can be array from backend or string in form
  is_active: boolean;
  sort_order: number;
}

export default function AdminMembershipManagement() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    classes_included: '',
    duration_days: '',
    price: '',
    benefits: '',
    is_active: true,
    sort_order: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Check if user is admin
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role !== 'admin') {
        navigate('/');
        return;
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch membership plans
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/memberships/plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch plans');
      const data = await res.json();
      setPlans(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingId
        ? `http://localhost:3000/memberships/admin/plans/${editingId}`
        : 'http://localhost:3000/memberships/admin/plans';

      // Convert benefits string to array (split by commas or newlines)
      const benefitsArray = formData.benefits
        .split(/[\n,]/)
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          classes_included: Number(formData.classes_included),
          duration_days: Number(formData.duration_days),
          price: parseFloat(formData.price),
          benefits: benefitsArray,
          sort_order: Number(formData.sort_order) || 1,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            'Failed to save plan. Check the fields with those in the backend.',
        );
      }

      // Reset form and refresh
      setFormData({
        name: '',
        description: '',
        classes_included: '',
        duration_days: '',
        price: '',
        benefits: '',
        is_active: true,
        sort_order: '',
      });
      setEditingId(null);
      setShowForm(false);
      fetchPlans();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    // Convert benefits array to string (one per line) for the textarea
    const benefitsString = Array.isArray(plan.benefits)
      ? plan.benefits.join('\n')
      : plan.benefits || '';

    setFormData({
      name: plan.name,
      description: plan.description,
      classes_included: String(plan.classes_included),
      duration_days: String(plan.duration_days),
      price: String(plan.price),
      benefits: benefitsString,
      is_active: plan.is_active,
      sort_order: String(plan.sort_order),
    });
    setEditingId(plan.plan_id);
    setShowForm(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this membership plan?'))
      return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:3000/memberships/admin/plans/${planId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error('Failed to delete plan');
      fetchPlans();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div>
        <NavigationHeader />
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavigationHeader />

      <div
        style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }}
      >
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#333' }}>
              📋 Membership Management
            </h1>
            <p style={{ margin: '8px 0 0', color: '#666' }}>
              Create and manage membership plans for clients
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) {
                setEditingId(null);
                setFormData({
                  name: '',
                  description: '',
                  classes_included: '',
                  duration_days: '',
                  price: '',
                  benefits: '',
                  is_active: true,
                  sort_order: '',
                });
              }
            }}
            style={{
              backgroundColor: showForm ? '#757575' : '#1976D2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add New Plan'}
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFEBEE',
              color: '#C62828',
              padding: '16px',
              borderRadius: '6px',
              marginBottom: '24px',
            }}
          >
            ⚠️ Error: {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ margin: '0 0 24px', fontSize: '20px' }}>
              {editingId
                ? 'Edit Membership Plan'
                : 'Create New Membership Plan'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    placeholder="e.g., Gold Membership"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    placeholder="e.g., 3500.00"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    💰 Price in Kenyan Shillings (KES)
                  </small>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Classes Included *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.classes_included}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classes_included: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    placeholder="e.g., 20"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration_days}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_days: e.target.value,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    placeholder="e.g., 30"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical',
                    }}
                    placeholder="Brief description of the membership plan"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Benefits (Optional)
                  </label>
                  <textarea
                    value={formData.benefits}
                    onChange={(e) =>
                      setFormData({ ...formData, benefits: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical',
                    }}
                    placeholder="Enter benefits, one per line. Example:&#10;4 classes per month&#10;Email support&#10;Priority booking"
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    💡 Enter each benefit on a new line, or separate with commas
                  </small>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontWeight: 500,
                      fontSize: '14px',
                    }}
                  >
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({ ...formData, sort_order: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                    placeholder="Display order (default: 1)"
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    id="is_active"
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label
                    htmlFor="is_active"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    Active (visible to clients)
                  </label>
                </div>
              </div>

              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      classes_included: '',
                      duration_days: '',
                      price: '',
                      benefits: '',
                      is_active: true,
                      sort_order: '',
                    });
                  }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {editingId ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Plans List */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '24px',
          }}
        >
          {plans.length === 0 ? (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ margin: '0 0 8px', color: '#666' }}>
                No Membership Plans Yet
              </h3>
              <p style={{ margin: 0, color: '#999' }}>
                Click "Add New Plan" to create your first membership plan
              </p>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.plan_id}
                style={{
                  backgroundColor: 'white',
                  padding: '24px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                }}
              >
                {!plan.is_active && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#FFF3E0',
                      color: '#F57C00',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    INACTIVE
                  </div>
                )}

                <h3
                  style={{
                    margin: '0 0 12px',
                    fontSize: '20px',
                    color: '#1976D2',
                  }}
                >
                  {plan.name}
                </h3>

                <div
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#4CAF50',
                    marginBottom: '16px',
                  }}
                >
                  KES {plan.price.toLocaleString()}
                </div>

                <p
                  style={{
                    margin: '0 0 16px',
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: 1.5,
                  }}
                >
                  {plan.description}
                </p>

                <div
                  style={{
                    marginBottom: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '8px',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    <span>📅</span>
                    <span>{plan.duration_days} days validity</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: '#555',
                    }}
                  >
                    <span>🎫</span>
                    <span>{plan.classes_included} classes included</span>
                  </div>
                </div>

                {plan.benefits && (
                  <div
                    style={{
                      marginBottom: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid #eee',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#999',
                        marginBottom: '8px',
                      }}
                    >
                      BENEFITS
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {plan.benefits}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #eee',
                  }}
                >
                  <button
                    onClick={() => handleEdit(plan)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.plan_id)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
