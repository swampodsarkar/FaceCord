export const uploadToCloudinary = async (file: File, type: 'video' | 'image' = 'video') => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'SUAbfm3Q0S9BjzzbnJH68OtOp0k';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'SUAbfm3Q0S9BjzzbnJH68OtOp0k';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
