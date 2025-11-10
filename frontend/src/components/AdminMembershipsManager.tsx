import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';

const BASE = 'https://atara-dajy.onrender.com';

interface MembershipPlan {
  plan_id: number;
  name: string;
  description: string;
  classes_included: number;
  duration_days: number;
  price: number;
  benefits: string;
  is_active: boolean;
  sort_order: number;
}

interface FormData {
  name: string;
  description: string;
  classes_included: string;
  duration_days: string;
  price: string;
  benefits: string;
  sort_order: string;
}

export default function AdminMembershipsManager() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    classes_included: '',
    duration_days: '',
    price: '',
    benefits: '',
    sort_order: '1',
  });

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE}/memberships/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPlans(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      toast.error('Failed to load membership plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const parseBenefits = (benefitsStr: string): string[] => {
    if (Array.isArray(benefitsStr)) return benefitsStr;
    try {
      return JSON.parse(benefitsStr);
    } catch {
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.classes_included ||
      !formData.duration_days ||
      !formData.price ||
      !formData.benefits
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const benefitsArray = formData.benefits
        .split('\n')
        .map((b) => b.trim())
        .filter((b) => b.length > 0);

      const payload = {
        name: formData.name,
        description: formData.description,
        classes_included: parseInt(formData.classes_included),
        duration_days: parseInt(formData.duration_days),
        price: parseFloat(formData.price),
        benefits: benefitsArray,
        sort_order: parseInt(formData.sort_order) || 1,
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${BASE}/memberships/admin/plans/${editingId}`
        : `${BASE}/memberships/admin/plans`;

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save plan');
      }

      toast.success(
        editingId
          ? '✅ Plan updated successfully!'
          : '✅ Plan created successfully!',
      );
      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        classes_included: '',
        duration_days: '',
        price: '',
        benefits: '',
        sort_order: '1',
      });
      fetchPlans();
    } catch (err: any) {
      console.error('Error saving plan:', err);
      toast.error(err.message || 'Failed to save plan');
    }
  };

  const handleEdit = (plan: MembershipPlan) => {
    setEditingId(plan.plan_id);
    setFormData({
      name: plan.name,
      description: plan.description,
      classes_included: plan.classes_included.toString(),
      duration_days: plan.duration_days.toString(),
      price: plan.price.toString(),
      benefits: parseBenefits(plan.benefits).join('\n'),
      sort_order: plan.sort_order.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${BASE}/memberships/admin/plans/${planId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Failed to delete plan');

      toast.success('✅ Plan deleted successfully!');
      fetchPlans();
    } catch (err: any) {
      console.error('Error deleting plan:', err);
      toast.error(err.message || 'Failed to delete plan');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      classes_included: '',
      duration_days: '',
      price: '',
      benefits: '',
      sort_order: '1',
    });
  };

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>💳 Membership Plans</h3>
        <button
          className="button"
          onClick={() => setShowForm(!showForm)}
          style={{
            backgroundColor: showForm ? '#f44336' : '#4CAF50',
            color: 'white',
            padding: '8px 16px',
            fontSize: 12,
          }}
        >
          {showForm ? '⬆️ Collapse Form' : '➕ Show Form'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 16,
            backgroundColor: '#f9f9f9',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid #e0e0e0',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Plan Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Flow Starter"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Price (KES) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 1500"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Classes Included *
              </label>
              <input
                type="number"
                name="classes_included"
                value={formData.classes_included}
                onChange={handleInputChange}
                placeholder="e.g., 4 (use 999 for unlimited)"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Duration (Days) *
              </label>
              <input
                type="number"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleInputChange}
                placeholder="e.g., 30"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 4,
                }}
              >
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                placeholder="e.g., 1"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 4,
              }}
            >
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="e.g., Perfect for your wellness journey"
              rows={2}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 4,
              }}
            >
              Benefits (one per line) *
            </label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleInputChange}
              placeholder="1 class per month&#10;Email support&#10;Flexible scheduling"
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: 4,
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            />
            <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
              Enter each benefit on a new line
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="submit"
              className="button"
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                flex: 1,
              }}
            >
              {editingId ? 'Update Plan' : 'Create Plan'}
            </button>
            <button
              type="button"
              className="button"
              onClick={resetForm}
              style={{
                backgroundColor: '#f0f0f0',
                color: '#333',
                padding: '10px 20px',
              }}
            >
              Clear
            </button>
          </div>
        </form>
      )}

      {/* Plans List */}
      <div style={{ marginTop: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', padding: 20 }}>
            Loading plans...
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 20 }}>
            No membership plans yet. Create one to get started!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {plans.map((plan) => (
              <div
                key={plan.plan_id}
                style={{
                  padding: 12,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 6,
                  borderLeft: '4px solid #4CAF50',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {plan.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
                    {plan.description}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <strong>
                      KES {Math.round(plan.price).toLocaleString()}
                    </strong>{' '}
                    •{' '}
                    {plan.classes_included === 999
                      ? 'Unlimited classes'
                      : `${plan.classes_included} classes`}{' '}
                    • {Math.ceil(plan.duration_days / 30)} month(s)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleEdit(plan)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan.plan_id)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
