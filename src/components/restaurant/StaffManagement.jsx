import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  ChefHat,
  Shield,
  Timer,
  BarChart3,
  Settings,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Briefcase
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const StaffManagement = () => {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Server',
      email: 'sarah.johnson@restaurant.com',
      phone: '+1 (555) 123-4567',
      hireDate: new Date('2023-01-15'),
      status: 'active',
      hourlyRate: 15.50,
      weeklyHours: 35,
      performance: {
        rating: 4.8,
        sales: 2850,
        tips: 420,
        customerSatisfaction: 95
      },
      schedule: {
        monday: '9:00-17:00',
        tuesday: '9:00-17:00',
        wednesday: '9:00-17:00',
        thursday: '9:00-17:00',
        friday: '16:00-22:00',
        saturday: '16:00-22:00',
        sunday: 'off'
      },
      permissions: ['take_orders', 'process_payments', 'view_reports']
    },
    {
      id: 2,
      name: 'Mike Davis',
      role: 'Kitchen Manager',
      email: 'mike.davis@restaurant.com',
      phone: '+1 (555) 234-5678',
      hireDate: new Date('2022-06-01'),
      status: 'active',
      hourlyRate: 22.00,
      weeklyHours: 45,
      performance: {
        rating: 4.9,
        efficiency: 98,
        foodQuality: 96,
        teamManagement: 94
      },
      schedule: {
        monday: '10:00-20:00',
        tuesday: '10:00-20:00',
        wednesday: '10:00-20:00',
        thursday: '10:00-20:00',
        friday: '10:00-22:00',
        saturday: '10:00-22:00',
        sunday: 'off'
      },
      permissions: ['manage_kitchen', 'manage_staff', 'view_reports', 'manage_inventory']
    },
    {
      id: 3,
      name: 'Lisa Chen',
      role: 'Bartender',
      email: 'lisa.chen@restaurant.com',
      phone: '+1 (555) 345-6789',
      hireDate: new Date('2023-03-10'),
      status: 'active',
      hourlyRate: 18.00,
      weeklyHours: 32,
      performance: {
        rating: 4.7,
        drinkQuality: 97,
        speed: 92,
        customerService: 94
      },
      schedule: {
        monday: 'off',
        tuesday: '16:00-22:00',
        wednesday: '16:00-22:00',
        thursday: '16:00-22:00',
        friday: '16:00-24:00',
        saturday: '16:00-24:00',
        sunday: '16:00-22:00'
      },
      permissions: ['mix_drinks', 'process_payments', 'manage_bar_inventory']
    },
    {
      id: 4,
      name: 'Tom Wilson',
      role: 'Line Cook',
      email: 'tom.wilson@restaurant.com',
      phone: '+1 (555) 456-7890',
      hireDate: new Date('2023-08-15'),
      status: 'active',
      hourlyRate: 16.50,
      weeklyHours: 40,
      performance: {
        rating: 4.5,
        speed: 88,
        accuracy: 95,
        teamwork: 90
      },
      schedule: {
        monday: '11:00-19:00',
        tuesday: '11:00-19:00',
        wednesday: '11:00-19:00',
        thursday: '11:00-19:00',
        friday: '15:00-23:00',
        saturday: '15:00-23:00',
        sunday: 'off'
      },
      permissions: ['cook_orders', 'manage_kitchen_inventory']
    },
    {
      id: 5,
      name: 'Emma Rodriguez',
      role: 'Hostess',
      email: 'emma.rodriguez@restaurant.com',
      phone: '+1 (555) 567-8901',
      hireDate: new Date('2024-01-20'),
      status: 'active',
      hourlyRate: 14.00,
      weeklyHours: 28,
      performance: {
        rating: 4.6,
        customerService: 96,
        waitTime: 85,
        reservationManagement: 92
      },
      schedule: {
        monday: '11:00-15:00',
        tuesday: '11:00-15:00',
        wednesday: '11:00-15:00',
        thursday: '11:00-15:00',
        friday: '11:00-19:00',
        saturday: '11:00-19:00',
        sunday: '11:00-15:00'
      },
      permissions: ['manage_reservations', 'seat_customers']
    }
  ]);

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const roles = ['Server', 'Kitchen Manager', 'Bartender', 'Line Cook', 'Hostess', 'Dishwasher', 'Manager'];

  const getRoleColor = (role) => {
    const colors = {
      'Server': 'bg-blue-100 text-blue-800',
      'Kitchen Manager': 'bg-red-100 text-red-800',
      'Bartender': 'bg-purple-100 text-purple-800',
      'Line Cook': 'bg-orange-100 text-orange-800',
      'Hostess': 'bg-pink-100 text-pink-800',
      'Dishwasher': 'bg-gray-100 text-gray-800',
      'Manager': 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'on_leave': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const calculatePayroll = () => {
    return staff
      .filter(member => member.status === 'active')
      .reduce((total, member) => total + (member.hourlyRate * member.weeklyHours), 0);
  };

  const getAverageRating = () => {
    const totalRating = staff.reduce((sum, member) => sum + (member.performance.rating || 0), 0);
    return (totalRating / staff.length).toFixed(1);
  };

  const StaffCard = ({ member }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
              <Badge className={`${getRoleColor(member.role)} border`}>
                {member.role}
              </Badge>
            </div>
          </div>
          <Badge className={`${getStatusColor(member.status)} border`}>
            {member.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{member.performance.rating}</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">${member.hourlyRate.toFixed(2)}</div>
            <div className="text-xs text-gray-600">/hour</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            {member.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            {member.phone}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Hired: {member.hireDate.toLocaleDateString()}
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            <strong>{member.weeklyHours}h/week</strong>
          </div>
          <div className="text-sm font-semibold text-green-600">
            ${(member.hourlyRate * member.weeklyHours).toFixed(2)}/week
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => {
              setEditingStaff(member);
              setShowStaffForm(true);
            }}
            variant="outline"
            size="sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            onClick={() => {/* Handle clock in/out */}}
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
          >
            <Timer className="w-4 h-4 mr-1" />
            Clock
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StaffStats = () => {
    const stats = {
      total: staff.length,
      active: staff.filter(s => s.status === 'active').length,
      averageRating: getAverageRating(),
      totalPayroll: calculatePayroll(),
      averageHourlyRate: (staff.reduce((sum, s) => sum + s.hourlyRate, 0) / staff.length).toFixed(2)
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Active Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">${stats.averageHourlyRate}</div>
            <div className="text-sm text-gray-600">Avg Hourly Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">${stats.totalPayroll.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Weekly Payroll</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const ScheduleOverview = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Schedule Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium">Staff Member</th>
                  {dayLabels.map(day => (
                    <th key={day} className="text-center py-2 px-3 font-medium min-w-20">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.filter(member => member.status === 'active').map(member => (
                  <tr key={member.id} className="border-b">
                    <td className="py-2 px-3 font-medium">{member.name}</td>
                    {days.map(day => (
                      <td key={day} className="text-center py-2 px-3">
                        <div className="text-xs">
                          {member.schedule[day] === 'off' ? (
                            <span className="text-gray-400">Off</span>
                          ) : (
                            <span className="text-green-600 font-medium">
                              {member.schedule[day]}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-orange-600" />
            Staff Management
          </h1>
          <p className="text-gray-600 mt-2">Manage restaurant staff, schedules, and performance</p>
        </div>
        <Button
          onClick={() => setShowStaffForm(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {/* Stats */}
      <StaffStats />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Overview */}
      <ScheduleOverview />

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Staff Directory ({filteredStaff.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map(member => (
                <StaffCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Form Modal */}
      {showStaffForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowStaffForm(false);
                    setEditingStaff(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="staff@restaurant.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Hours
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="on_leave">On Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hire Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowStaffForm(false);
                      setEditingStaff(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
