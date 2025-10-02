import { useState, useEffect } from 'react';
import axios from 'axios';

interface Purchase {
  id: string;
  content: {
    id: string;
    title: string;
    description: string;
    type: string;
    price: string;
  };
  createdAt: string;
}

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  monthlyPrice: string;
}

function ViewerDashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchSubscription();
  }, []);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('/api/purchases/my-purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await axios.get('/api/subscriptions/my-subscription');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleSubscribe = async (paymentMethod: string) => {
    setSubscribing(true);
    try {
      await axios.post('/api/subscriptions', {
        paymentMethod,
        cryptoTxId: paymentMethod === 'CRYPTO' ? 'sub_tx_' + Date.now() : undefined
      });
      alert('Subscription created successfully!');
      fetchSubscription();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      await axios.delete(`/api/subscriptions/${subscription.id}`);
      alert('Subscription cancelled');
      fetchSubscription();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Cancellation failed');
    }
  };

  return (
    <div>
      <h1>Viewer Dashboard</h1>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>Subscription</h2>
        {subscription && subscription.status === 'ACTIVE' ? (
          <div>
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>End Date:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
            <p><strong>Price:</strong> ${subscription.monthlyPrice}/month</p>
            <button
              onClick={handleCancelSubscription}
              className="btn btn-danger"
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <div>
            <p>Get unlimited access to all content for $29.99/month</p>
            <button
              onClick={() => handleSubscribe('CARD')}
              disabled={subscribing}
              className="btn btn-primary"
              style={{ marginRight: '10px' }}
            >
              Subscribe with Card
            </button>
            <button
              onClick={() => handleSubscribe('CRYPTO')}
              disabled={subscribing}
              className="btn btn-primary"
            >
              Subscribe with Crypto
            </button>
          </div>
        )}
      </div>

      <h2>My Purchases</h2>
      <div className="grid">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="card">
            <h3>{purchase.content.title}</h3>
            <p>{purchase.content.description}</p>
            <p><strong>Type:</strong> {purchase.content.type}</p>
            <p><strong>Purchased:</strong> {new Date(purchase.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ViewerDashboard;
