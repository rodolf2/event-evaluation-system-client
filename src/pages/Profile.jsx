import { useAuth } from "../contexts/useAuth";
import PSASLayout from "../components/psas/PSASLayout";

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PSASLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        <div className="bg-white p-4 rounded-lg shadow">
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      </div>
    </PSASLayout>
  );
}

export default Profile;
