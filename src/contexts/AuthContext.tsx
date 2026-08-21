import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export interface Customer {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  companyName: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
}

export interface ProfileData {
  fullName: string;
  phone: string;
  companyName: string;
  gstNumber: string;
  billingAddress: string;
  shippingAddress: string;
}

interface AuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (email: string, password: string, profileData: ProfileData) => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        loadCustomerProfile(
          session.user.id,
          session.user.email!,
          metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User'
        );
      } else if (event === 'SIGNED_OUT') {
        setCustomer(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        await loadCustomerProfile(
          session.user.id,
          session.user.email!,
          metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User'
        );
      }
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerProfile = async (
    userId: string,
    email: string,
    fallbackName: string = 'User'
  ) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Database query for user_profiles warning:', error.message);
      }

      if (profile) {
        setCustomer({
          id: userId,
          email,
          fullName: profile.full_name || fallbackName,
          phone: profile.phone_number || '',
          companyName: profile.company_name || '',
          gstNumber: profile.gst_number || '',
          billingAddress: profile.billing_address || '',
          shippingAddress: profile.shipping_address || '',
        });
      } else {
        // Create initial profile record for new OAuth/Google user
        const newProfile = {
          id: userId,
          full_name: fallbackName,
          phone_number: '',
          company_name: '',
          gst_number: '',
          billing_address: '',
          shipping_address: '',
        };

        setCustomer({
          id: userId,
          email,
          fullName: fallbackName,
          phone: '',
          companyName: '',
          gstNumber: '',
          billingAddress: '',
          shippingAddress: '',
        });

        // Try background insert if table exists
        supabase
          .from('user_profiles')
          .insert(newProfile)
          .then(({ error: insertError }) => {
            if (insertError) {
              console.warn('Could not auto-insert profile into Supabase:', insertError.message);
            }
          });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setCustomer({
        id: userId,
        email,
        fullName: fallbackName,
        phone: '',
        companyName: '',
        gstNumber: '',
        billingAddress: '',
        shippingAddress: '',
      });
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadCustomerProfile(
          data.user.id,
          data.user.email!,
          data.user.user_metadata?.full_name || email.split('@')[0]
        );
      }
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to initiate Google OAuth sign in');
    }
  };

  const signup = async (
    email: string,
    password: string,
    profileData: ProfileData
  ) => {
    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: profileData.fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Failed to create user');
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          full_name: profileData.fullName,
          phone_number: profileData.phone,
          company_name: profileData.companyName,
          gst_number: profileData.gstNumber,
          billing_address: profileData.billingAddress,
          shipping_address: profileData.shippingAddress,
        });

      if (profileError) {
        console.warn('Profile insert warning:', profileError.message);
      }

      await loadCustomerProfile(data.user.id, data.user.email!, profileData.fullName);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<ProfileData>) => {
    if (!customer) return;

    setIsLoading(true);
    try {
      const updatedFields: any = {};
      if (profileData.fullName !== undefined) updatedFields.full_name = profileData.fullName;
      if (profileData.phone !== undefined) updatedFields.phone_number = profileData.phone;
      if (profileData.companyName !== undefined) updatedFields.company_name = profileData.companyName;
      if (profileData.gstNumber !== undefined) updatedFields.gst_number = profileData.gstNumber;
      if (profileData.billingAddress !== undefined) updatedFields.billing_address = profileData.billingAddress;
      if (profileData.shippingAddress !== undefined) updatedFields.shipping_address = profileData.shippingAddress;

      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: customer.id, ...updatedFields });

      if (error) {
        console.warn('Upsert profile error:', error.message);
      }

      setCustomer((prev) =>
        prev
          ? {
              ...prev,
              fullName: profileData.fullName ?? prev.fullName,
              phone: profileData.phone ?? prev.phone,
              companyName: profileData.companyName ?? prev.companyName,
              gstNumber: profileData.gstNumber ?? prev.gstNumber,
              billingAddress: profileData.billingAddress ?? prev.billingAddress,
              shippingAddress: profileData.shippingAddress ?? prev.shippingAddress,
            }
          : null
      );
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        loginWithGoogle,
        signup,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
