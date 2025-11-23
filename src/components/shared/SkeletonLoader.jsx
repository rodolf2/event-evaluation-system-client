import React from "react";

// Base Skeleton component
export const SkeletonBase = ({ className = "", animate = true }) => (
  <div
    className={`
      bg-gray-300 rounded
      ${animate ? "animate-pulse" : ""}
      ${className}
    `}
  />
);

// Text skeleton for paragraphs, titles, etc.
export const SkeletonText = ({
  lines = 1,
  width = "full",
  height = "h-4",
  className = "",
  animate = true,
}) => {
  const widths = {
    full: "w-full",
    small: "w-20",
    medium: "w-32",
    large: "w-48",
    extraLarge: "w-64",
    custom: width,
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBase
          key={index}
          className={`${widths[width]} ${height} ${
            index === lines - 1 && lines > 1 ? "w-3/4" : ""
          }`}
          animate={animate}
        />
      ))}
    </div>
  );
};

// Card skeleton for content cards
export const SkeletonCard = ({
  showImage = true,
  showTitle = true,
  showContent = true,
  contentLines = 3,
  className = "",
}) => (
  <div className={`bg-white rounded-lg shadow-md p-6 space-y-4 ${className}`}>
    {showImage && <SkeletonBase className="w-full h-48 rounded-lg" />}
    {showTitle && <SkeletonText lines={1} width="large" height="h-6" />}
    {showContent && <SkeletonText lines={contentLines} />}
  </div>
);

// Table skeleton for data tables
export const SkeletonTable = ({ rows = 5, columns = 3, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    {/* Header */}
    <div className="bg-gray-50 p-4">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBase
            key={`header-${index}`}
            className="h-4 bg-gray-400"
            style={{ width: `${100 / columns - 2}%` }}
          />
        ))}
      </div>
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={`row-${rowIndex}`} className="p-4 border-t border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBase
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4"
              style={{ width: `${100 / columns - 2}%` }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Avatar skeleton for profile pictures
export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <SkeletonBase className={`${sizes[size]} rounded-full ${className}`} />
  );
};

// Dashboard card skeleton
export const SkeletonDashboardCard = ({ className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
    <SkeletonBase className="w-full h-32" />
    <div className="p-4 space-y-3">
      <SkeletonText lines={1} width="medium" height="h-5" />
      <SkeletonText lines={2} />
      <SkeletonBase className="w-24 h-8 rounded-md" />
    </div>
  </div>
);

// Grid layout skeleton
export const SkeletonGrid = ({
  items = 6,
  columns = 3,
  className = "",
  // eslint-disable-next-line no-unused-vars
  ItemComponent = SkeletonCard,
}) => (
  <div
    className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(
      columns,
      4
    )} gap-6 ${className}`}
  >
    {Array.from({ length: items }).map((_, index) => (
      <ItemComponent key={index} />
    ))}
  </div>
);

// List skeleton for items
export const SkeletonList = ({
  items = 5,
  showAvatar = true,
  showMeta = true,
  className = "",
}) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
      >
        {showAvatar && <SkeletonAvatar size="md" />}
        <div className="flex-1 space-y-2">
          <SkeletonText lines={1} width="medium" height="h-4" />
          {showMeta && <SkeletonText lines={1} width="small" height="h-3" />}
        </div>
      </div>
    ))}
  </div>
);

// Full page skeleton loader
export const SkeletonPage = ({
  showSidebar = true,
  showHeader = true,
  showContent = true,
  contentType = "dashboard", // 'dashboard', 'list', 'table', 'form'
  className = "",
}) => (
  <div className={`min-h-screen bg-gray-100 ${className}`}>
    <div className="flex">
      {showSidebar && (
        <div className="w-64 bg-[#1F3463] hidden lg:block">
          {/* Sidebar skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <SkeletonAvatar size="lg" />
              <SkeletonText lines={1} width="medium" />
            </div>
            <div className="space-y-3 mt-8">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg"
                >
                  <SkeletonBase className="w-6 h-6" />
                  <SkeletonText lines={1} width="small" height="h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 lg:p-8">
        {showHeader && (
          <div className="mb-8">
            <SkeletonText
              lines={1}
              width="large"
              height="h-8"
              className="mb-2"
            />
            <SkeletonText lines={1} width="medium" />
          </div>
        )}

        {showContent && (
          <div>
            {contentType === "dashboard" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <SkeletonDashboardCard />
                </div>
                <div className="space-y-6">
                  <SkeletonCard contentLines={4} />
                </div>
              </div>
            )}
            {contentType === "list" && <SkeletonList items={8} />}
            {contentType === "table" && <SkeletonTable rows={6} columns={4} />}
            {contentType === "form" && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                <SkeletonText lines={1} width="medium" height="h-6" />
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <SkeletonText lines={1} width="small" height="h-4" />
                      <SkeletonBase className="w-full h-10 rounded-md" />
                    </div>
                  ))}
                </div>
                <div className="flex space-x-4">
                  <SkeletonBase className="w-24 h-10 rounded-md" />
                  <SkeletonBase className="w-24 h-10 rounded-md" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Simple loading container with skeleton
export const SkeletonLoader = ({ type = "text", className = "", ...props }) => {
  switch (type) {
    case "text":
      return <SkeletonText className={className} {...props} />;
    case "card":
      return <SkeletonCard className={className} {...props} />;
    case "table":
      return <SkeletonTable className={className} {...props} />;
    case "avatar":
      return <SkeletonAvatar className={className} {...props} />;
    case "dashboard-card":
      return <SkeletonDashboardCard className={className} {...props} />;
    case "grid":
      return <SkeletonGrid className={className} {...props} />;
    case "list":
      return <SkeletonList className={className} {...props} />;
    case "page":
      return <SkeletonPage className={className} {...props} />;
    default:
      return <SkeletonBase className={className} {...props} />;
  }
};

export default SkeletonLoader;
