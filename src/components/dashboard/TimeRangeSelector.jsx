

const TimeRangeSelector = () => {
  const timeRangeOptions = [
    { value: 'today', label: 'Today', icon: Clock },
    { value: 'yesterday', label: 'Yesterday', icon: Clock },
    { value: '7days', label: 'Last 7 Days', icon: Calendar },
    { value: '30days', label: 'Last 30 Days', icon: Calendar },
    { value: '90days', label: 'Last 90 Days', icon: Calendar },
    { value: 'thisMonth', label: 'This Month', icon: Calendar },
    { value: 'lastMonth', label: 'Last Month', icon: Calendar },
    { value: 'custom', label: 'Custom Range', icon: Calendar }
  ];

  const handleTimeRangeChange = (value) => {
    // This would typically update the dashboard data based on the selected range
    console.log('Time range changed to:', value);
  };

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 px-3 py-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <Select
        value="today"
        onValueChange={handleTimeRangeChange}
        className="border-0 bg-transparent px-0 py-0 text-sm"
      >
        {timeRangeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Select.Option key={option.value} value={option.value}>
              <div className="flex items-center">
                <Icon className="h-4 w-4 mr-2" />
                {option.label}
              </div>
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
};

export default TimeRangeSelector;
