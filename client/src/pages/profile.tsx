
import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    jobTitle: '',
    yearsExperience: '',
    certifications: ''
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfileData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        companyName: data.companyName || '',
        jobTitle: data.jobTitle || '',
        yearsExperience: data.yearsExperience?.toString() || '',
        certifications: data.certifications || ''
      });
      return data;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
    onError: () => {
      toast.error('Failed to update profile');
    }
  });

  const handleSaveProfile = () => {
    const updateData = {
      ...profileData,
      yearsExperience: profileData.yearsExperience ? parseInt(profileData.yearsExperience) : null
    };
    updateProfileMutation.mutate(updateData);
  };

  const updateField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-2xl text-muted-foreground mb-2"></i>
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-sm mx-auto min-h-screen bg-background border-x border-border">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full bg-secondary/50">
                <i className="fas fa-arrow-left text-sm"></i>
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold">Profile</h1>
              <p className="text-xs text-muted-foreground">Manage your account</p>
            </div>
          </div>
          <Badge variant={profile?.subscriptionTier === 'free' ? 'secondary' : 'default'}>
            {profile?.subscriptionTier?.charAt(0).toUpperCase() + profile?.subscriptionTier?.slice(1)}
          </Badge>
        </div>

        {/* Profile Form */}
        <div className="px-6 space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Personal Information</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  value={profileData.phoneNumber}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Professional Information</h3>
              
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={profileData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="Enter company name"
                />
              </div>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={profileData.jobTitle}
                  onChange={(e) => updateField('jobTitle', e.target.value)}
                  placeholder="Enter job title"
                />
              </div>

              <div className="space-y-2">
                <Label>Years of Experience</Label>
                <Select value={profileData.yearsExperience} onValueChange={(value) => updateField('yearsExperience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">0-1 years</SelectItem>
                    <SelectItem value="3">2-3 years</SelectItem>
                    <SelectItem value="5">4-5 years</SelectItem>
                    <SelectItem value="10">6-10 years</SelectItem>
                    <SelectItem value="15">11-15 years</SelectItem>
                    <SelectItem value="20">16-20 years</SelectItem>
                    <SelectItem value="25">20+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Certifications</Label>
                <Textarea
                  value={profileData.certifications}
                  onChange={(e) => updateField('certifications', e.target.value)}
                  placeholder="List your welding certifications..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            onClick={handleSaveProfile} 
            disabled={updateProfileMutation.isPending}
            className="w-full"
          >
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
          </Button>

          {/* Subscription Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Subscription</h3>
                <Badge variant={profile?.subscriptionTier === 'free' ? 'secondary' : 'default'}>
                  {profile?.subscriptionTier?.charAt(0).toUpperCase() + profile?.subscriptionTier?.slice(1)}
                </Badge>
              </div>
              
              {profile?.subscriptionTier === 'free' ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Upgrade to Premium for unlimited calculations, advanced tools, and more features.
                  </p>
                  <Link href="/subscription">
                    <Button variant="outline" size="sm" className="w-full">
                      <i className="fas fa-crown mr-2"></i>
                      Upgrade to Premium
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Your subscription is active. Enjoy unlimited access to all features.
                  </p>
                  {profile?.subscriptionExpiresAt && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {new Date(profile.subscriptionExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
