import AddCarScreen from './AddCarScreen';

// Legacy route alias so existing navigation (OwnerHomeDashboard FAB, etc.) keeps working.
// We simply render the new Firestore-backed AddCarScreen here.
export default function AddNewCarScreen(props) {
  return <AddCarScreen {...props} />;
}
