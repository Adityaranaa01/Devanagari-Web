import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersService, Order, OrderItem } from '../services/supabase';

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<(Order & { order_items: OrderItem[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        const userOrders = await ordersService.getUserOrders(user.id);
        setOrders(userOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#FDFBF8] pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please sign in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF8] pt-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center space-x-4 mb-8">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata.full_name || 'User'} 
              className="h-16 w-16 rounded-full border-2 border-[#4A5C3D] shadow-lg" 
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-gray-200 border-2 border-[#4A5C3D] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#4A5C3D]">
                {(user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <div className="text-3xl font-bold text-[#4A5C3D]">{user.user_metadata?.full_name || 'User'}</div>
            <div className="text-lg text-gray-600">{user.email}</div>
          </div>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold text-[#4A5C3D] mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <div className="text-lg text-[#4A5C3D] font-medium">
                {user.user_metadata?.full_name || 'Not provided'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="text-lg text-[#4A5C3D] font-medium">
                {user.email || 'Not provided'}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Note:</span> Your profile information is automatically synced from your account. 
              To update your name or photo, please change it in your account settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order History */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#4A5C3D] mb-4">Order History</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A5C3D] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No orders yet</p>
                <a
                  href="/shop"
                  className="inline-block bg-[#4A5C3D] text-white px-4 py-2 rounded-lg hover:bg-[#3a4a2f] transition-colors"
                >
                  Start Shopping
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-[#4A5C3D]">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#4A5C3D]">${order.total.toFixed(2)}</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product?.name || 'Product'} × {item.quantity}</span>
                          <span>${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address Management */}
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-[#4A5C3D] mb-4">Address Management</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Address management coming soon!</p>
              <p className="text-sm text-gray-500">
                This feature will allow you to save and manage multiple shipping addresses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;