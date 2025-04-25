const StatusLegend = () => {
    return (
      <div className="bg-white rounded-lg p-4 shadow-md">
        <h3 className="font-bold mb-2">Room Status </h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-50 border border-red-200 mr-2 rounded"></div>
            <span>Full</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 mr-2 rounded"></div>
            <span>Partially Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border border-green-200 mr-2 rounded"></div>
            <span>Empty</span>
          </div>
        </div>
      </div>
    );
  };
  
  export default StatusLegend;