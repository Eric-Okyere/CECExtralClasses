export default function SubjectCard({ title }) {
  return (
    <div className="bg-white shadow p-4 rounded-lg hover:shadow-lg cursor-pointer">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );
}