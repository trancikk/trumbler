import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface Content {
  id: string;
  title: string;
  description: string;
  type: string;
  price: string;
  fullFilePath?: string;
  previewFilePath?: string;
}

function ContentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`/api/content/${id}`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (paymentMethod: string) => {
    if (!user || user.role !== 'VIEWER') {
      alert('Please login as a viewer to purchase');
      return;
    }

    setPurchasing(true);
    try {
      await axios.post('/api/purchases', {
        contentId: id,
        paymentMethod,
        cryptoTxId: paymentMethod === 'CRYPTO' ? 'tx_' + Date.now() : undefined
      });
      alert('Purchase successful!');
      fetchContent();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!content) {
    return <div>Content not found</div>;
  }

  return (
    <div className="card">
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <p><strong>Type:</strong> {content.type}</p>
      <p><strong>Price:</strong> ${content.price}</p>

      {content.fullFilePath ? (
        <div>
          <h3>Full Content</h3>
          {content.type === 'VIDEO' ? (
            <video src={`/${content.fullFilePath}`} controls style={{ width: '100%' }} />
          ) : (
            <img src={`/${content.fullFilePath}`} alt={content.title} style={{ width: '100%' }} />
          )}
        </div>
      ) : (
        <div>
          {content.previewFilePath && (
            <div>
              <h3>Preview</h3>
              {content.type === 'VIDEO' ? (
                <video src={`/${content.previewFilePath}`} controls style={{ width: '100%' }} />
              ) : (
                <img src={`/${content.previewFilePath}`} alt={content.title} style={{ width: '100%' }} />
              )}
            </div>
          )}
          {user && user.role === 'VIEWER' && (
            <div style={{ marginTop: '20px' }}>
              <h3>Purchase to view full content</h3>
              <button
                onClick={() => handlePurchase('CARD')}
                disabled={purchasing}
                className="btn btn-primary"
                style={{ marginRight: '10px' }}
              >
                Pay with Card
              </button>
              <button
                onClick={() => handlePurchase('CRYPTO')}
                disabled={purchasing}
                className="btn btn-primary"
              >
                Pay with Crypto
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ContentDetail;
