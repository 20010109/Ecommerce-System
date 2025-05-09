import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/authService';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    first_name: '',
    phone_number: '',
    shop_name: '',
    gender: '',
    birth_date: '',
    profile_image_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data); // Set the profile fields from the response
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.message);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(profile)
      .then((res) => {
        setMessage(res.message); // Profile updated successfully
      })
      .catch((err) => {
        console.error(err);
        setMessage(err.message);
      });
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>My Profile</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            type="text"
            name="phone_number"
            value={profile.phone_number || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Shop Name:</label>
          <input
            type="text"
            name="shop_name"
            value={profile.shop_name || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Gender:</label>
          <input
            type="text"
            name="gender"
            value={profile.gender || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Birth Date (YYYY-MM-DD):</label>
          <input
            type="text"
            name="birth_date"
            value={profile.birth_date || ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Profile Image URL:</label>
          <input
            type="text"
            name="profile_image_url"
            value={profile.profile_image_url || ''}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default ProfilePage;
