export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div className="flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center space-x-1">
        <div className="w-1 h-1 bg-foreground rounded-full"></div>
        <div className="w-1 h-1 bg-foreground rounded-full"></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
      </div>
      <div className="text-sm font-medium">{currentTime}</div>
      <div className="flex items-center space-x-1">
        <i className="fas fa-signal text-xs"></i>
        <i className="fas fa-wifi text-xs"></i>
        <div className="flex items-center">
          <div className="w-6 h-3 border border-foreground rounded-sm">
            <div className="w-4 h-1.5 bg-foreground rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
