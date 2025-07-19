// src/components/SupportForm.jsx

import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';

const PAYPAL_CLIENT_ID = "AbjThWMNtESH0SmnlspQbFWhrOtWQLrNvssWLDPMDhi85EdSWwhw7d43YzgQ1AFhfY04UfxZba472Uvq";
const PAYPAL_PLAN_ID = "P-1TR89454SR837114ANB5LM7I";

const SupportForm = () => {
  const { user } = useAuth();
  
  // --- THE FIX IS HERE ---
  // The state is now initialized as an empty string again,
  // allowing new users to type in their own link.
  const [socialLink, setSocialLink] = useState(''); 
  
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleValidation = (data, actions) => {
    if (!user) {
      setError("You must be logged in to subscribe.");
      return actions.reject();
    }
    if (!socialLink || !socialLink.startsWith('http')) {
      setError("Please enter a valid and complete social media URL.");
      return actions.reject();
    }
    setError('');
    return actions.resolve();
  };

  const handleApprove = async (data, actions) => {
    setIsProcessing(true);
    setError('');
    try {
      if (!user || !user.id) {
        throw new Error("User object is invalid or missing ID.");
      }

      const { error: insertError } = await supabase
        .from('supporters')
        .insert({
          user_id: user.id,
          paypal_subscription_id: data.subscriptionID,
          social_media_link: socialLink,
          status: 'active'
        });

      if (insertError) {
        throw insertError;
      }
      
      setIsSubscribed(true);

    } catch (err) {
      setError('An error occurred while saving. Error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="success-message">
        <h2>Thank you for your support!</h2>
        <p>You are now on the Forge Supporters page.</p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, vault: true, intent: "subscription" }}>
        <div className="support-form-container">
            <h2>Become a BlenderForge Patron</h2>
            <p>Get your profile on the Forge Supporters page and help keep the platform running.</p>
            <div className="form-group">
                <label htmlFor="socialLink">Your Social Media Link</label>
                <input
                    id="socialLink"
                    type="url"
                    className="form-input"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                    disabled={isProcessing}
                    placeholder="https://twitter.com/your-profile"
                />
            </div>
            {error && <p className="error-text" style={{color: 'red'}}>{error}</p>}
            {isProcessing ? (
                <p>Processing your subscription...</p>
            ) : (
                <PayPalButtons
                    style={{ layout: "vertical", label: "subscribe", shape: 'pill', color: 'black' }}
                    onClick={handleValidation}
                    createSubscription={(data, actions) => {
                        return actions.subscription.create({ plan_id: PAYPAL_PLAN_ID });
                    }}
                    onApprove={handleApprove}
                    onError={(err) => { setError(`PayPal Error: ${err.message}`); }}
                />
            )}
        </div>
    </PayPalScriptProvider>
  );
};

export default SupportForm;