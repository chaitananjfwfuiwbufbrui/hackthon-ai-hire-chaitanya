import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { ArrowRight, Search, User } from "lucide-react";
import axios from "axios";

interface Candidate {
  id: number;
  name: string;
  skills: string[];
  experience: string;
  education: string;
  contact: {
    email: string;
    phone: string;
  };
  summary: string;
  similarity_score: number;
}

interface SearchResponse {
  matches: Candidate[];
  analysis: string;
}

const TalentSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [viewType, setViewType] = useState<"grid" | "table">("grid");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      
      try {
        const response = await axios.post<SearchResponse>(
          'http://localhost:8000/api/search/search/',
          {
            query: searchQuery,
            location: null,
            experience_years: null
          }
        );
        
        setSearchResults(response.data.matches);
        setAnalysis(response.data.analysis);
      } catch (error) {
        console.error('Error searching candidates:', error);
        setSearchResults([]);
        setAnalysis("Error searching candidates. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  // Apply filters to search results
  const filteredResults = activeFilters.length > 0
    ? searchResults.filter(candidate => {
        return activeFilters.some(filter => {
          if (candidate.skills.includes(filter)) return true;
          if (filter === "5+ years" && parseInt(candidate.experience) >= 5) return true;
          return false;
        });
      })
    : searchResults;

  // Convert similarity score to percentage
  const getMatchScore = (score: number) => {
    return Math.round(score * 100);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Smart Talent Search</h1>
          <p className="text-gray-600 text-lg">
            Find the perfect candidates using natural language search
          </p>
        </div>
        
        <div className="mb-8">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Find React developers in Bangalore with 5+ years experience"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-6 text-lg"
                />
              </div>
              <Button type="submit" disabled={isSearching} size="lg">
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <span>Search</span>
                )}
              </Button>
            </div>
          </form>

          {searchQuery && !isSearching && searchResults.length === 0 && (
            <div className="mt-8 text-center py-12 border border-dashed rounded-md">
              <p className="text-gray-600">No candidates found matching your search criteria.</p>
            </div>
          )}
        </div>

        {analysis && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analysis</h2>
            <div className="prose max-w-none">
              {analysis.split('\n').map((line, i) => (
                <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        )}

        {filteredResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Filters:</span>
                {["React", "Node.js", "TypeScript", "Python", "Machine Learning", "5+ years"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      activeFilters.includes(filter)
                        ? "bg-recruiter-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } transition-colors`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">View:</span>
                <Tabs value={viewType} className="w-24">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger 
                      value="grid" 
                      onClick={() => setViewType("grid")}
                      className={viewType === "grid" ? "data-[state=active]:bg-recruiter-primary data-[state=active]:text-white" : ""}
                    >
                      Grid
                    </TabsTrigger>
                    <TabsTrigger 
                      value="table" 
                      onClick={() => setViewType("table")}
                      className={viewType === "table" ? "data-[state=active]:bg-recruiter-primary data-[state=active]:text-white" : ""}
                    >
                      Table
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <Tabs defaultValue={viewType} className="w-full" value={viewType}>
              <TabsContent value="grid" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.map((candidate) => (
                    <Card key={candidate.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{candidate.name}</h3>
                              <p className="text-gray-600">{candidate.education}</p>
                            </div>
                            <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                              {getMatchScore(candidate.similarity_score)}%
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-1 mb-3">
                              {candidate.skills.slice(0, 5).map((skill) => (
                                <span 
                                  key={skill} 
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                    ${searchQuery.toLowerCase().includes(skill.toLowerCase())
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Experience:</span> {candidate.experience}
                            </p>
                          </div>
                        </div>
                        
                        <div className="border-t px-6 py-3 bg-gray-50 flex justify-end">
                          <Button variant="link" size="sm" asChild>
                            <Link to={`/candidates/${candidate.id}/profile`}>
                              View Profile <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="table" className="mt-0">
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skills
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Education
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Experience
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Match Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredResults.map((candidate) => (
                        <tr key={candidate.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <Link 
                                  to={`/candidates/${candidate.id}/profile`}
                                  className="font-medium hover:text-primary transition-colors"
                                >
                                  {candidate.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">{candidate.education}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {candidate.skills.slice(0, 3).map((skill) => (
                                <span 
                                  key={skill} 
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {candidate.education}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {candidate.experience}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-xs font-medium inline-block">
                              {getMatchScore(candidate.similarity_score)}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button variant="link" size="sm" asChild>
                              <Link to={`/candidates/${candidate.id}/profile`}>
                                View Profile
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default TalentSearch;
