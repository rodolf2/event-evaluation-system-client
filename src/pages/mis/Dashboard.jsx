import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function MisDashboard() {
  const { removeToken } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">MIS Dashboard</h1>
        <button
          onClick={removeToken}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
      <nav>
        <ul>
          <li>
            <Link
              to="/mis/user-management"
              className="text-blue-500 hover:underline"
            >
              User Management
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default MisDashboard;
