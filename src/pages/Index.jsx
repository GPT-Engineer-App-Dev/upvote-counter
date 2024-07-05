import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { debounce } from "lodash";

const fetchTopStories = async () => {
  const response = await fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json"
  );
  const storyIds = await response.json();
  const top100Ids = storyIds.slice(0, 100);

  const storyPromises = top100Ids.map((id) =>
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then((res) =>
      res.json()
    )
  );

  return Promise.all(storyPromises);
};

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stories, isLoading, error } = useQuery({
    queryKey: ["topStories"],
    queryFn: fetchTopStories,
  });

  const debouncedSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const filteredStories = stories?.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <div>Error fetching stories: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Input
        type="text"
        placeholder="Search stories..."
        onChange={handleSearchChange}
        className="mb-4"
      />
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(9)].map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories?.map((story) => (
            <Card key={story.id}>
              <CardHeader>
                <CardTitle className="text-lg">{story.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-2">
                  Upvotes: {story.score}
                </p>
                <a
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline flex items-center"
                >
                  Read more
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;