export default function VideoPlayer({ videoUrl }) {
  return (
    <video controls className="w-full rounded-lg">
      <source src={videoUrl} />
    </video>
  );
}