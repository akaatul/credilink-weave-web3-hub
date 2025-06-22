
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, User } from "@/contexts/AuthContext";
import { Edit3, Save, X, Shield, Award, Briefcase, GraduationCap } from "lucide-react";

const UserProfile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  if (!user) return null;

  const handleEdit = () => {
    setEditData({ ...user });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({});
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="space-y-2">
                {isEditing ? (
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="text-center font-bold"
                  />
                ) : (
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                )}
                
                <Badge 
                  variant={user.role === 'student' ? 'default' : 'secondary'}
                  className={`${user.role === 'student' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {user.role === 'student' ? (
                    <><GraduationCap className="w-4 h-4 mr-1" /> Student</>
                  ) : (
                    <><Briefcase className="w-4 h-4 mr-1" /> Recruiter</>
                  )}
                </Badge>
                
                {user.isVerified && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              {user.address && (
                <div>
                  <Label className="text-sm text-gray-500">Wallet Address</Label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </p>
                </div>
              )}
              
              {user.email && (
                <div>
                  <Label className="text-sm text-gray-500">Email</Label>
                  <p className="text-sm">{user.email}</p>
                </div>
              )}
              
              <div className="flex justify-center space-x-2">
                {!isEditing ? (
                  <Button onClick={handleEdit} size="sm">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={editData.bio || ''}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-gray-700">
                    {user.bio || 'No bio added yet.'}
                  </p>
                )}
              </div>

              {user.role === 'student' && (
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  {isEditing ? (
                    <Input
                      id="experience"
                      value={editData.experience || ''}
                      onChange={(e) => setEditData({ ...editData, experience: e.target.value })}
                      placeholder="e.g., Beginner, Intermediate, Advanced"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">
                      {user.experience || 'Not specified'}
                    </p>
                  )}
                </div>
              )}

              {user.role === 'recruiter' && (
                <div>
                  <Label htmlFor="company">Company</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      value={editData.company || ''}
                      onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                      placeholder="Company name"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-700">
                      {user.company || 'Not specified'}
                    </p>
                  )}
                </div>
              )}

              <div>
                <Label>Skills</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats/Achievements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 mr-2" />
              {user.role === 'student' ? 'Achievements' : 'Recruitment Stats'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {user.role === 'student' ? '0' : '0'}
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'student' ? 'Courses Completed' : 'Candidates Hired'}
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {user.role === 'student' ? '0' : '0'}
                </div>
                <p className="text-sm text-gray-600">
                  {user.role === 'student' ? 'Certificates Earned' : 'Active Job Posts'}
                </p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {user.isVerified ? '1' : '0'}
                </div>
                <p className="text-sm text-gray-600">Verifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
