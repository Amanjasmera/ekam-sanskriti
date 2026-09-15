import lessons from '@/data/lessons.json';

export default function LearnPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-saffron-600">Learn from Masters</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="bg-white rounded-xl shadow-sm overflow-hidden border">
            <video 
              controls 
              poster={lesson.thumbnail}
              className="w-full aspect-video object-cover bg-black"
            >
              <source src={lesson.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">{lesson.duration}</span>
              </div>
              <p className="text-saffron-600 font-semibold mb-6">By {lesson.artist}</p>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold mb-4">Comments</h3>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add a comment..." className="border rounded px-3 py-2 flex-1 text-sm" />
                  <button className="bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2 rounded text-sm font-semibold">Post</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
