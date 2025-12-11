import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, updateProfilePhoto } from "../store/userSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.user);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      try {
        console.log("📸 Starting upload...");
        console.log("File:", selectedFile.name, selectedFile.size);
        const result = await dispatch(updateProfilePhoto(selectedFile));
        console.log("✅ Upload success:", result);
        setSelectedFile(null);
        setPreviewUrl(null);
      } catch (err) {
        console.error("❌ Upload failed:", err);
        console.error("Error details:", err.message);
        console.error("Error response:", err.response?.data);
      }
    }
  };

  if (!user) {
    return <div className="loading-container">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-photo-section">
          <div className="current-photo">
            <img
              src={
                previewUrl ||
                user.profile_photo ||
                "https://via.placeholder.com/200?text=No+Photo"
              }
              alt="Profile"
              className="profile-photo"
            />
          </div>

          <form onSubmit={handleUpload} className="photo-upload-form">
            <div className="form-group">
              <label htmlFor="photo" className="file-label">
                Choose New Photo
              </label>
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </div>

            {selectedFile && (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Photo"}
              </button>
            )}
          </form>
        </div>

        <div className="profile-info">
          <div className="info-item">
            <label>Full Name</label>
            <p>{user.full_name}</p>
          </div>

          <div className="info-item">
            <label>Email</label>
            <p>{user.email}</p>
          </div>

          <div className="info-item">
            <label>Member Since</label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

