import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Default table data structure with enhanced features
const defaultTables = [
  {
    id: 1,
    number: 'T1',
    capacity: 4,
    status: 'available',
    section: 'Main Dining',
    position: { x: 120, y: 120 },
    shape: 'round',
    occupiedSeats: 0,
    floor: 1,
    groupId: null,
    isMerged: false,
    mergedTables: [],
    availableSeats: 4
  },
  {
    id: 2,
    number: 'T2',
    capacity: 2,
    status: 'occupied',
    section: 'Main Dining',
    position: { x: 200, y: 120 },
    shape: 'square',
    occupiedSeats: 2,
    floor: 1,
    groupId: null,
    isMerged: false,
    mergedTables: [],
    availableSeats: 0
  },
  {
    id: 3,
    number: 'T3',
    capacity: 6,
    status: 'available',
    section: 'Main Dining',
    position: { x: 280, y: 120 },
    shape: 'round',
    occupiedSeats: 0,
    floor: 1,
    groupId: null,
    isMerged: false,
    mergedTables: [],
    availableSeats: 6
  },
  {
    id: 4,
    number: 'B1',
    capacity: 4,
    status: 'reserved',
    section: 'Bar Area',
    position: { x: 450, y: 100 },
    shape: 'high-top',
    occupiedSeats: 0,
    floor: 1,
    groupId: null,
    isMerged: false,
    mergedTables: [],
    availableSeats: 0
  },
  {
    id: 5,
    number: 'V1',
    capacity: 8,
    status: 'available',
    section: 'VIP Section',
    position: { x: 700, y: 120 },
    shape: 'oval',
    occupiedSeats: 0,
    floor: 1,
    groupId: null,
    isMerged: false,
    mergedTables: [],
    availableSeats: 8
  }
];

// Create the context
const TableContext = createContext();

// Custom hook to use the table context
export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};

// Provider component
export const TableProvider = ({ children }) => {
  const [tables, setTables] = useState(() => {
    // Try to load from localStorage first
    const savedTables = localStorage.getItem('restaurantTables');
    return savedTables ? JSON.parse(savedTables) : defaultTables;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to calculate available seats
  const calculateAvailableSeats = useCallback((table) => {
    if (table.status === 'available') {
      return table.capacity;
    } else if (table.status === 'occupied') {
      return Math.max(0, table.capacity - (table.occupiedSeats || 0));
    } else if (table.status === 'reserved') {
      return 0; // Reserved tables have no available seats
    } else if (table.status === 'cleaning') {
      return 0; // Cleaning tables have no available seats
    }
    return table.capacity; // Default fallback
  }, []);

  // Save to localStorage whenever tables change
  useEffect(() => {
    localStorage.setItem('restaurantTables', JSON.stringify(tables));
  }, [tables]);

  // Get all tables
  const getAllTables = useCallback(() => {
    return tables;
  }, [tables]);

  // Get tables by floor
  const getTablesByFloor = useCallback((floorId) => {
    return tables.filter(table => table.floor === floorId);
  }, [tables]);

  // Get available tables
  const getAvailableTables = useCallback(() => {
    return tables.filter(table => table.status === 'available');
  }, [tables]);

  // Get table by ID
  const getTableById = useCallback((id) => {
    return tables.find(table => table.id === id) || null;
  }, [tables]);

  // Create new table
  const createTable = useCallback((tableData) => {
    try {
      setLoading(true);
      const newTable = {
        id: Date.now(),
        number: tableData.number,
        capacity: tableData.capacity || 4,
        status: 'available',
        section: tableData.section || 'Main Dining',
        shape: tableData.shape || 'round',
        occupiedSeats: 0,
        floor: tableData.floor || 1,
        position: tableData.position || {
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50
        },
        ...tableData
      };

      setTables(prev => [...prev, newTable]);
      console.log(`Table ${newTable.number} created successfully`);

      return { success: true, table: newTable };
    } catch (err) {
      console.error('Failed to create table: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update table
  const updateTable = useCallback((id, updates) => {
    try {
      setLoading(true);
      setTables(prev => prev.map(table =>
        table.id === id ? { ...table, ...updates } : table
      ));

      const updatedTable = tables.find(t => t.id === id);
      if (updatedTable) {
        console.log(`Table ${updatedTable.number} updated successfully`);
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to update table: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [tables]);

  // Update table status
  const updateTableStatus = useCallback((id, status, occupiedSeats = 0) => {
    try {
      setTables(prev => prev.map(table => {
        if (table.id === id) {
          const updatedTable = {
            ...table,
            status,
            occupiedSeats: status === 'available' ? 0 : occupiedSeats
          };
          // Calculate and update availableSeats based on new status
          updatedTable.availableSeats = calculateAvailableSeats(updatedTable);
          return updatedTable;
        }
        return table;
      }));

      const table = tables.find(t => t.id === id);
      if (table) {
        console.log(`Table ${table.number} status updated to ${status}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to update table status: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [tables, calculateAvailableSeats]);

  // Update occupied seats
  const updateOccupiedSeats = useCallback((id, occupiedSeats) => {
    try {
      const table = tables.find(t => t.id === id);
      if (!table) {
        throw new Error('Table not found');
      }

      if (occupiedSeats > table.capacity) {
        throw new Error(`Cannot occupy more seats than capacity (${table.capacity})`);
      }

      if (occupiedSeats < 0) {
        throw new Error('Occupied seats cannot be negative');
      }

      setTables(prev => prev.map(table => {
        if (table.id === id) {
          const updatedTable = {
            ...table,
            occupiedSeats,
            status: occupiedSeats > 0 ? 'occupied' : 'available'
          };
          // Calculate and update availableSeats based on new occupied seats
          updatedTable.availableSeats = calculateAvailableSeats(updatedTable);
          return updatedTable;
        }
        return table;
      }));

      return { success: true };
    } catch (err) {
      console.error(err.message);
      return { success: false, error: err.message };
    }
  }, [tables, calculateAvailableSeats]);

  // Delete table
  const deleteTable = useCallback((id) => {
    try {
      setLoading(true);
      const table = tables.find(t => t.id === id);
      if (!table) {
        throw new Error('Table not found');
      }

      setTables(prev => prev.filter(table => table.id !== id));
      console.log(`Table ${table.number} deleted successfully`);

      return { success: true };
    } catch (err) {
      console.error('Failed to delete table: ' + err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [tables]);

  // Move table to different floor
  const moveTableToFloor = useCallback((id, targetFloorId) => {
    try {
      setTables(prev => prev.map(table =>
        table.id === id ? { ...table, floor: targetFloorId } : table
      ));

      const table = tables.find(t => t.id === id);
      if (table) {
        console.log(`Table ${table.number} moved to floor ${targetFloorId}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Failed to move table: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [tables]);

  // Get table statistics
  const getTableStats = useCallback(() => {
    const totalTables = tables.length;
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    const totalOccupiedSeats = tables.reduce((sum, t) => sum + (t.occupiedSeats || 0), 0);

    return {
      totalTables,
      availableTables,
      occupiedTables,
      reservedTables,
      totalCapacity,
      totalOccupiedSeats,
      utilizationRate: totalCapacity > 0 ? Math.round((totalOccupiedSeats / totalCapacity) * 100) : 0
    };
  }, [tables]);

  // Create table group (merge tables)
  const createTableGroup = useCallback((tableIds, groupName = null) => {
    try {
      if (tableIds.length < 2 || tableIds.length > 3) {
        throw new Error('Table group must have 2-3 tables');
      }

      const groupTables = tables.filter(table => tableIds.includes(table.id));
      const unavailableTables = groupTables.filter(table => table.status !== 'available');

      if (unavailableTables.length > 0) {
        throw new Error('All tables in group must be available');
      }

      const groupId = `group_${Date.now()}`;
      const totalCapacity = groupTables.reduce((sum, table) => sum + table.capacity, 0);

      // Create merged table entry
      const mergedTable = {
        id: Date.now(),
        number: groupName || `Group ${groupTables.map(t => t.number).join('+')}`,
        capacity: totalCapacity,
        status: 'available',
        section: groupTables[0].section,
        position: groupTables[0].position,
        shape: 'merged',
        occupiedSeats: 0,
        floor: groupTables[0].floor,
        groupId: groupId,
        isMerged: true,
        mergedTables: tableIds,
        availableSeats: totalCapacity
      };

      // Update individual tables to be part of the group
      setTables(prev => [
        ...prev.map(table =>
          tableIds.includes(table.id)
            ? { ...table, groupId: groupId, isMerged: false }
            : table
        ),
        mergedTable
      ]);

      console.log(`Table group created: ${mergedTable.number} (${totalCapacity} seats)`);
      return { success: true, groupId, mergedTable };
    } catch (err) {
      console.error('Failed to create table group: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [tables]);

  // Dissolve table group
  const dissolveTableGroup = useCallback((groupId) => {
    try {
      const mergedTable = tables.find(table => table.groupId === groupId && table.isMerged);
      if (!mergedTable) {
        throw new Error('Table group not found');
      }

      // Reset individual tables
      setTables(prev => [
        ...prev.filter(table => !(table.groupId === groupId && table.isMerged)),
        ...prev
          .filter(table => table.groupId === groupId && !table.isMerged)
          .map(table => ({
            ...table,
            groupId: null,
            isMerged: false,
            status: 'available',
            occupiedSeats: 0,
            availableSeats: table.capacity
          }))
      ]);

      console.log(`Table group dissolved: ${mergedTable.number}`);
      return { success: true };
    } catch (err) {
      console.error('Failed to dissolve table group: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [tables]);

  // Get table group
  const getTableGroup = useCallback((groupId) => {
    const mergedTable = tables.find(table => table.groupId === groupId && table.isMerged);
    const groupTables = tables.filter(table => table.groupId === groupId && !table.isMerged);

    if (!mergedTable) return null;

    return {
      mergedTable,
      individualTables: groupTables,
      totalCapacity: mergedTable.capacity,
      availableSeats: mergedTable.availableSeats,
      occupiedSeats: mergedTable.occupiedSeats
    };
  }, [tables]);

  // Allocate seats to table (enhanced version)
  const allocateSeats = useCallback((tableId, requestedSeats, customerCount = null) => {
    try {
      const table = tables.find(t => t.id === tableId);
      if (!table) {
        throw new Error('Table not found');
      }

      // If it's a merged table, allocate across the group
      if (table.isMerged) {
        const groupTables = tables.filter(t => t.groupId === table.groupId && !t.isMerged);
        let remainingSeats = requestedSeats;
        let allocatedTables = [];

        // Sort tables by capacity (largest first for optimal allocation)
        const sortedTables = [...groupTables].sort((a, b) => b.capacity - a.capacity);

        for (const groupTable of sortedTables) {
          if (remainingSeats <= 0) break;

          const seatsToAllocate = Math.min(remainingSeats, groupTable.capacity);
          allocatedTables.push({
            tableId: groupTable.id,
            seatsAllocated: seatsToAllocate
          });

          remainingSeats -= seatsToAllocate;
        }

        if (remainingSeats > 0) {
          throw new Error('Not enough seats available in table group');
        }

        // Update individual tables
        setTables(prev => prev.map(t => {
          const allocation = allocatedTables.find(a => a.tableId === t.id);
          if (allocation) {
            return {
              ...t,
              occupiedSeats: allocation.seatsAllocated,
              availableSeats: t.capacity - allocation.seatsAllocated,
              status: 'occupied'
            };
          }
          return t;
        }));

        // Update merged table
        setTables(prev => prev.map(t =>
          t.id === tableId
            ? {
                ...t,
                occupiedSeats: requestedSeats,
                availableSeats: t.capacity - requestedSeats,
                status: 'occupied'
              }
            : t
        ));

        console.log(`Allocated ${requestedSeats} seats to table group ${table.number}`);
        return { success: true, allocatedTables };
      } else {
        // Single table allocation
        if (requestedSeats > table.capacity) {
          throw new Error(`Requested seats (${requestedSeats}) exceed table capacity (${table.capacity})`);
        }

        setTables(prev => prev.map(t =>
          t.id === tableId
            ? {
                ...t,
                occupiedSeats: requestedSeats,
                availableSeats: t.capacity - requestedSeats,
                status: requestedSeats > 0 ? 'occupied' : 'available'
              }
            : t
        ));
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to allocate seats: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [tables]);

  // Get available seating options
  const getAvailableSeatingOptions = useCallback((partySize, preferredSection = null) => {
    const options = [];

    // Single table options
    const singleTables = tables.filter(table =>
      !table.isMerged &&
      table.groupId === null &&
      table.status === 'available' &&
      table.capacity >= partySize &&
      (!preferredSection || table.section === preferredSection)
    );

    singleTables.forEach(table => {
      options.push({
        type: 'single',
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity,
        availableSeats: table.capacity,
        section: table.section,
        efficiency: partySize / table.capacity // How well it fits the party
      });
    });

    // Merged table options
    const mergedTables = tables.filter(table =>
      table.isMerged &&
      table.status === 'available' &&
      table.capacity >= partySize &&
      (!preferredSection || table.section === preferredSection)
    );

    mergedTables.forEach(table => {
      options.push({
        type: 'merged',
        tableId: table.id,
        tableNumber: table.number,
        capacity: table.capacity,
        availableSeats: table.capacity,
        section: table.section,
        efficiency: partySize / table.capacity,
        individualTables: table.mergedTables.length
      });
    });

    // Sort by efficiency (best fit first)
    return options.sort((a, b) => a.efficiency - b.efficiency);
  }, [tables]);

  // Reset all tables to default state
  const resetTables = useCallback(() => {
    try {
      setTables(defaultTables);
      localStorage.setItem('restaurantTables', JSON.stringify(defaultTables));
      console.log('Tables reset to default state');
      return { success: true };
    } catch (err) {
      console.error('Failed to reset tables: ' + err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const value = {
    tables,
    loading,
    error,
    getAllTables,
    getTablesByFloor,
    getAvailableTables,
    getTableById,
    createTable,
    updateTable,
    updateTableStatus,
    updateOccupiedSeats,
    deleteTable,
    moveTableToFloor,
    getTableStats,
    createTableGroup,
    dissolveTableGroup,
    getTableGroup,
    allocateSeats,
    getAvailableSeatingOptions,
    resetTables,
    setError,
    clearError: () => setError(null)
  };

  return (
    <TableContext.Provider value={value}>
      {children}
    </TableContext.Provider>
  );
};
