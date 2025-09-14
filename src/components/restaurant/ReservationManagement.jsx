import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  MapPin,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Table,
  ChefHat,
  CalendarDays,
  Timer
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const ReservationManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('19:00');
  const [reservations, setReservations] = useState([
    {
      id: 1,
      customerName: 'John Smith',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
      partySize: 4,
      tableId: 'T1',
      tableNumber: 1,
      reservationDate: new Date(),
      reservationTime: '19:00',
      status: 'confirmed',
      specialRequests: 'Window seat preferred',
      server: 'Sarah Johnson',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 2,
      customerName: 'Emma Wilson',
      phone: '+1 (555) 987-6543',
      email: 'emma.wilson@email.com',
      partySize: 2,
      tableId: 'T5',
      tableNumber: 5,
      reservationDate: new Date(),
      reservationTime: '20:30',
      status: 'arrived',
      specialRequests: 'Celebrating anniversary',
      server: 'Mike Davis',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
    },
    {
      id: 3,
      customerName: 'David Brown',
      phone: '+1 (555) 456-7890',
      email: 'david.brown@email.com',
      partySize: 6,
      tableId: 'T3',
      tableNumber: 3,
      reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      reservationTime: '18:00',
      status: 'confirmed',
      specialRequests: 'High chair needed',
      server: 'Lisa Chen',
      createdAt: new Date(Date.now() - 30 * 60 * 1000)
    },
    {
      id: 4,
      customerName: 'Maria Garcia',
      phone: '+1 (555) 234-5678',
      email: 'maria.garcia@email.com',
      partySize: 3,
      tableId: 'T2',
      tableNumber: 2,
      reservationDate: new Date(),
      reservationTime: '21:00',
      status: 'pending',
      specialRequests: 'Vegetarian options',
      server: 'Tom Wilson',
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    }
  ]);

  const [showReservationForm, setShowReservationForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Time slots for reservations
  const timeSlots = [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  // Mock table data
  const tables = [
    { id: 'T1', number: 1, capacity: 4, section: 'Main Dining' },
    { id: 'T2', number: 2, capacity: 2, section: 'Main Dining' },
    { id: 'T3', number: 3, capacity: 6, section: 'Main Dining' },
    { id: 'T4', number: 4, capacity: 4, section: 'Bar Area' },
    { id: 'T5', number: 5, capacity: 8, section: 'VIP Section' }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'confirmed': 'bg-green-100 text-green-800 border-green-300',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'arrived': 'bg-blue-100 text-blue-800 border-blue-300',
      'completed': 'bg-gray-100 text-gray-800 border-gray-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'confirmed': CheckCircle,
      'pending': Clock,
      'arrived': User,
      'completed': CheckCircle,
      'cancelled': XCircle
    };
    return icons[status] || Clock;
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.phone.includes(searchTerm) ||
                         reservation.tableNumber.toString().includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;

    const isSelectedDate = reservation.reservationDate.toDateString() === selectedDate.toDateString();

    return matchesSearch && matchesStatus && isSelectedDate;
  });

  const getReservationsForTimeSlot = (time) => {
    return reservations.filter(res =>
      res.reservationTime === time &&
      res.reservationDate.toDateString() === selectedDate.toDateString()
    );
  };

  const updateReservationStatus = (id, newStatus) => {
    setReservations(reservations.map(res =>
      res.id === id ? { ...res, status: newStatus } : res
    ));
  };

  const deleteReservation = (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      setReservations(reservations.filter(res => res.id !== id));
    }
  };

  const ReservationCard = ({ reservation }) => {
    const StatusIcon = getStatusIcon(reservation.status);

    return (
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{reservation.customerName}</h3>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Phone className="w-4 h-4 mr-1" />
                {reservation.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <Table className="w-4 h-4 mr-1" />
                Table {reservation.tableNumber} • {reservation.partySize} guests
              </div>
            </div>
            <Badge className={`${getStatusColor(reservation.status)} border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {reservation.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {reservation.reservationTime}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {reservation.server}
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
              <p className="text-sm text-blue-800">
                <strong>Special Requests:</strong> {reservation.specialRequests}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setEditingReservation(reservation);
                setShowReservationForm(true);
              }}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => deleteReservation(reservation.id)}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TimeSlotGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {timeSlots.map(time => {
        const slotReservations = getReservationsForTimeSlot(time);
        const isFullyBooked = slotReservations.length >= tables.length;

        return (
          <div
            key={time}
            className={`p-4 border rounded-lg transition-colors ${
              isFullyBooked
                ? 'bg-red-50 border-red-200'
                : slotReservations.length > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-gray-900">{time}</h4>
              <Badge variant={isFullyBooked ? 'destructive' : 'secondary'}>
                {slotReservations.length}/{tables.length} tables
              </Badge>
            </div>

            <div className="space-y-2">
              {slotReservations.map(reservation => (
                <div key={reservation.id} className="text-sm">
                  <div className="font-medium text-gray-900">{reservation.customerName}</div>
                  <div className="text-gray-600">Table {reservation.tableNumber} • {reservation.partySize} guests</div>
                </div>
              ))}

              {slotReservations.length === 0 && (
                <div className="text-sm text-gray-500 italic">No reservations</div>
              )}
            </div>

            <Button
              onClick={() => {
                setSelectedTime(time);
                setShowReservationForm(true);
              }}
              className="w-full mt-3"
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Reservation
            </Button>
          </div>
        );
      })}
    </div>
  );

  const ReservationStats = () => {
    const todayReservations = reservations.filter(res =>
      res.reservationDate.toDateString() === selectedDate.toDateString()
    );

    const stats = {
      total: todayReservations.length,
      confirmed: todayReservations.filter(r => r.status === 'confirmed').length,
      arrived: todayReservations.filter(r => r.status === 'arrived').length,
      pending: todayReservations.filter(r => r.status === 'pending').length,
      totalGuests: todayReservations.reduce((sum, r) => sum + r.partySize, 0)
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Reservations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.arrived}</div>
            <div className="text-sm text-gray-600">Arrived</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.totalGuests}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CalendarDays className="w-8 h-8 mr-3 text-orange-600" />
            Reservation Management
          </h1>
          <p className="text-gray-600 mt-2">Manage table reservations and customer bookings</p>
        </div>
        <Button
          onClick={() => setShowReservationForm(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Reservation
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000))}
                variant="outline"
                size="sm"
              >
                Previous Day
              </Button>
              <Button
                onClick={() => setSelectedDate(new Date())}
                variant="outline"
                size="sm"
              >
                Today
              </Button>
              <Button
                onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000))}
                variant="outline"
                size="sm"
              >
                Next Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <ReservationStats />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reservations by name, phone, or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="arrived">Arrived</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Time Slots Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeSlotGrid />
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Today's Reservations ({filteredReservations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reservations found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Form Modal */}
      {showReservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {editingReservation ? 'Edit Reservation' : 'New Reservation'}
                </CardTitle>
                <Button
                  onClick={() => {
                    setShowReservationForm(false);
                    setEditingReservation(null);
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
                      Customer Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter customer name"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="customer@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Party Size
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reservation Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reservation Time
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Table Assignment
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} - {table.capacity} seats ({table.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any special requests or notes..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={() => {
                      setShowReservationForm(false);
                      setEditingReservation(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {editingReservation ? 'Update Reservation' : 'Create Reservation'}
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

export default ReservationManagement;
