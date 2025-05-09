import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/authService';
import './common/ProfilePage.css';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const navigate = useNavigate();

  // Fetch profile when the page loads
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setEditData(data); // Pre-fill edit form
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.message);
        setLoading(false);
      });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(editData)
        .then((res) => {
            setMessage(res.message);
            setIsEditing(false);
            fetchProfile();
            window.location.reload(); // ✅ Force refresh Header + everything
        })
      .catch((err) => {
        console.error(err);
        setMessage(err.message);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!profile) return <div>Failed to load profile.</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Left Side: Image + Basic Info */}
        <div className="profile-left">
          <img
            src={profile.profile_image_url || '/default-profile.png'}
            alt="Profile"
            className="profile-image-large"
          />
          <div className="profile-basic">
            <p><strong>{profile.username}</strong></p>
            <p>{profile.role}</p>
            <p>Status: {profile.status || 'Active'}</p>
          </div>
        </div>

        {/* Right Side: Full Details */}
        <div className="profile-right">
          <h2 className="profile-title">Profile Details</h2>
          {message && <p className="profile-message">{message}</p>}

          <div className="profile-section">
            <h4>Contact Information</h4>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone_number}</p>
            {profile.role === 'seller' && (
              <p><strong>Shop Name:</strong> {profile.shop_name}</p>
            )}
          </div>

          <div className="profile-section">
            <h4>Address</h4>
            <p>Street: {profile.address?.street || 'N/A'}</p>
            <p>City: {profile.address?.city || 'N/A'}</p>
            <p>State: {profile.address?.state || 'N/A'}</p>
            <p>Postal Code: {profile.address?.postal_code || 'N/A'}</p>
            <p>Country: {profile.address?.country || 'N/A'}</p>
          </div>

          <div className="profile-section">
            <h4>Basic Information</h4>
            <p><strong>First Name:</strong> {profile.first_name}</p>
            <p><strong>Last Name:</strong> {profile.last_name}</p>
            <p><strong>Updated At:</strong> {new Date(profile.updated_at).toLocaleString()}</p>
          </div>

          <div className="button-row">
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profile
            </button>
            <button className="logout-button-profile" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Editing */}
      {isEditing && (
        <div className="modal-overlay">
            <div className="modal-content">
            <div className="modal-header">
                ✏️ Edit Profile
            </div>
            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-section-title">Profile Information</div>

                <div className="form-group">
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={editData.username || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div className="form-group">
                <label>First Name:</label>
                <input
                    type="text"
                    name="first_name"
                    value={editData.first_name || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div className="form-group">
                <label>Last Name:</label>
                <input
                    type="text"
                    name="last_name"
                    value={editData.last_name || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div className="form-group">
                <label>Phone Number:</label>
                <input
                    type="text"
                    name="phone_number"
                    value={editData.phone_number || ''}
                    onChange={handleEditChange}
                />
                </div>
                <div className="form-group">
                <label>Profile Image URL:</label>
                <input
                    type="text"
                    name="profile_image_url"
                    value={editData.profile_image_url || ''}
                    onChange={handleEditChange}
                />
                </div>

                {profile.role === 'seller' && (
                <div className="form-group">
                    <label>Shop Name:</label>
                    <input
                    type="text"
                    name="shop_name"
                    value={editData.shop_name || ''}
                    onChange={handleEditChange}
                    />
                </div>
                )}

                <div className="form-section-title">Address</div>

                <div className="form-group">
                <label>Street:</label>
                <input
                    type="text"
                    name="street"
                    value={editData.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>City:</label>
                <input
                    type="text"
                    name="city"
                    value={editData.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>State:</label>
                <input
                    type="text"
                    name="state"
                    value={editData.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>Postal Code:</label>
                <input
                    type="text"
                    name="postal_code"
                    value={editData.address?.postal_code || ''}
                    onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                />
                </div>
                <div className="form-group">
                <label>Country:</label>
                <input
                    type="text"
                    name="country"
                    value={editData.address?.country || ''}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                />
                </div>

                <div className="modal-buttons">
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="cancel-button"
                >
                    ❌ Cancel
                </button>
                <button type="submit" className="save-button">
                    ✅ Save Changes
                </button>
                </div>
            </form>
            </div>
        </div>
        )}
    </div>
  );
};

export default ProfilePage;
