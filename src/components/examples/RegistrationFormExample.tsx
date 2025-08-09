// Example usage in a registration form component
import React, { useState } from 'react';
import { useRegistrationFormStorage } from '../../hooks/useFormSessionStorage';

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  year: string;
  termsAccepted: boolean;
}

const RegistrationFormExample: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    termsAccepted: false
  });

  // Use the form session storage hook
  const { saveFormData, clearFormData } = useRegistrationFormStorage(formData);

  // Load saved data when component mounts
  React.useEffect(() => {
    const savedData = sessionStorage.getItem('registration_form');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.warn('Failed to load saved registration data');
      }
    }
  }, []);

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Submit the form
      await submitRegistration(formData);
      
      // Clear saved data after successful submission
      clearFormData();
    } catch (error) {
      console.error('Registration failed:', error);
      // Data will remain saved for retry
    }
  };

  const submitRegistration = async (data: RegistrationFormData) => {
    // Your registration logic here
    console.log('Submitting registration:', data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
      />
      
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
      />
      
      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
      />
      
      <input
        type="text"
        placeholder="Year"
        value={formData.year}
        onChange={(e) => handleInputChange('year', e.target.value)}
      />
      
      <label>
        <input
          type="checkbox"
          checked={formData.termsAccepted}
          onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
        />
        Accept Terms and Conditions
      </label>
      
      <button type="submit">Register</button>
      <button type="button" onClick={clearFormData}>Clear Saved Data</button>
      <button type="button" onClick={saveFormData}>Save Now</button>
    </form>
  );
};

export default RegistrationFormExample;
