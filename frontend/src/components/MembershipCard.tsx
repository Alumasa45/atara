import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function MembershipCard() {
  const [expanded, setExpanded] = useState(false);
  const [activePlanId, setActivePlanId] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await api.fetchMembershipPlans();
        const planList = Array.isArray(data) ? data : data?.data || [];
        setPlans(planList);
      } catch (err) {
        console.error('Failed to fetch membership plans:', err);
        toast.error('Failed to load membership plans');
      } finally {
        setLoading(false);
      }
    };

    if (expanded) {
      fetchPlans();
    }
  }, [expanded]);

  const toggleExpand = () => {
    setExpanded((s) => !s);
    if (expanded) setActivePlanId(null);
  };

  const onSelectPlan = (id: number) => {
    setActivePlanId((prev) => (prev === id ? null : id));
  };

  const activePlan = plans.find((p) => p.plan_id === activePlanId) ?? null;

  const onPurchase = async () => {
    if (!activePlan) return;
    try {
      setPurchasing(true);
      const result = await api.purchaseMembership(activePlan.plan_id);
      toast.success(`🎉 Successfully purchased ${activePlan.name}!`);
      setActivePlanId(null);
      setExpanded(false);
    } catch (err: any) {
      toast.error(err.message || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const parseBenefits = (benefits: string | string[]) => {
    if (Array.isArray(benefits)) return benefits;
    try {
      return JSON.parse(benefits);
    } catch {
      return [];
    }
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={toggleExpand}
      >
        <h3 style={{ margin: 0 }}>💳 Membership Plans</h3>
        <div style={{ color: '#666' }}>
          {expanded ? 'Collapse ▲' : 'Expand ▼'}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div style={{ color: '#666', textAlign: 'center', padding: 20 }}>
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
              No membership plans available
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 12,
                }}
              >
                {plans.map((plan) => (
                  <div
                    key={plan.plan_id}
                    onClick={() => onSelectPlan(plan.plan_id)}
                    style={{
                      padding: 12,
                      borderRadius: 6,
                      backgroundColor:
                        activePlanId === plan.plan_id ? '#e8f5e9' : '#fff',
                      border:
                        activePlanId === plan.plan_id
                          ? '2px solid #4CAF50'
                          : '1px solid #eee',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 'bold', marginBottom: 6 }}>
                      {plan.name}
                    </div>
                    <div
                      style={{ fontSize: 12, color: '#666', marginBottom: 8 }}
                    >
                      {plan.duration_days === 999
                        ? 'Unlimited'
                        : `${Math.ceil(plan.duration_days / 30)} month(s)`}
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      KES {Math.round(plan.price).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {activePlan && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderTop: '1px solid #eee',
                  }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 16 }}>
                        {activePlan.name}
                      </div>
                      <div style={{ color: '#666', marginTop: 4 }}>
                        {activePlan.description}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>
                        KES {Math.round(activePlan.price).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {activePlan.duration_days === 999
                          ? 'Unlimited monthly'
                          : `${Math.ceil(activePlan.duration_days / 30)} month(s)`}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                      What's Included
                    </div>
                    <ul style={{ margin: '0 0 12px 0', paddingLeft: 20 }}>
                      {parseBenefits(activePlan.benefits).map(
                        (b: string, i: number) => (
                          <li
                            key={i}
                            style={{ color: '#444', marginBottom: 4 }}
                          >
                            {b}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                      className="button"
                      style={{
                        backgroundColor: '#4CAF50',
                        color: '#fff',
                        flex: 1,
                      }}
                      onClick={onPurchase}
                      disabled={purchasing}
                    >
                      {purchasing ? 'Processing...' : 'Buy Now'}
                    </button>
                    <button
                      className="button"
                      onClick={() => setActivePlanId(null)}
                      style={{ backgroundColor: '#eee', color: '#333' }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
