const CanvasContainer = ({ canvasRef, containerRef, children }) => {
  return (
    <div
      ref={containerRef}
      className="grow flex justify-center items-center bg-gray-200 p-4 lg:p-8 overflow-y-auto overflow-x-hidden"
    >
      <div className="bg-white shadow-lg p-4 max-w-full" style={{ margin: "auto" }}>
        <canvas
          ref={canvasRef}
          style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }}
        />
        {children}
      </div>
    </div>
  );
};

export default CanvasContainer;