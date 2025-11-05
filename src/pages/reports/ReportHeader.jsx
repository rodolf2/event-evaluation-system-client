// import React from "react";
// import Logo from "../../assets/logo/LOGO.png";


import HeaderImage from '../../assets/background-image/report_header.png';
const ReportHeader = () => {
  return (
    <div className="w-full">
      <img
        src={HeaderImage}
        alt="La Verdad Christian College Header"
        className="w-full object-cover rounded-t-lg"
      />
    </div>
  );
};


export default ReportHeader;

// const ReportHeader = () => {
  //   return (
    //     <div className="relative bg-white py-3 px-6 rounded-t-lg overflow-hidden flex items-center">
    //       {/* Left blue background with logo */}
    //       <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 transform -skew-x-12 origin-left"></div>

//       {/* Right gold background strip */}
//       <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-bl from-yellow-400 via-yellow-500 to-yellow-600 transform skew-x-12 origin-right"></div>

//       {/* Main Content */}
//       <div className="relative z-10 flex items-center ml-6">
//         <img
//           src={Logo}
//           alt="La Verdad Christian College Logo"
//           className="h-16 w-auto mr-4"
//         />
//         <div>
//           <h1 className="text-2xl font-bold text-blue-900 leading-tight">
//             LA VERDAD
//           </h1>
//           <h2 className="text-lg font-semibold text-blue-900 leading-tight">
//             CHRISTIAN COLLEGE, INC.
//           </h2>
//           <p className="text-sm text-gray-700 italic mt-1">Apalit, Pampanga</p>
//         </div>
//       </div>
//     </div>
//   );
// };
