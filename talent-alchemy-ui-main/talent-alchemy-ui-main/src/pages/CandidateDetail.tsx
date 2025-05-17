
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { mockCandidates, getScreeningQuestions, getOutreachTemplate, Candidate } from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [outreachEmail, setOutreachEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // Simulate API call to get candidate details
    setTimeout(() => {
      const foundCandidate = mockCandidates.find(c => c.id === id);
      if (foundCandidate) {
        setCandidate(foundCandidate);
        setScreeningQuestions(getScreeningQuestions(foundCandidate.skills));
        setOutreachEmail(getOutreachTemplate(foundCandidate));
      }
      setIsLoading(false);
    }, 800);
  }, [id]);

  const handleSendEmail = () => {
    setIsSending(true);
    // Simulate sending email
    setTimeout(() => {
      setIsSending(false);
      toast.success("Outreach email sent successfully!");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Candidate Not Found</h2>
            <p className="text-gray-600 mb-6">The candidate you are looking for does not exist.</p>
            <Button asChild>
              <Link to="/search">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link 
            to="/search"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search Results
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{candidate.name}</h1>
              <p className="text-gray-600">{candidate.location} • {candidate.experience} years experience</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium">
                Match Score: {candidate.matchScore}%
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile" className="data-[state=active]:bg-recruiter-primary data-[state=active]:text-white">
              Profile
            </TabsTrigger>
            <TabsTrigger value="screening" className="data-[state=active]:bg-recruiter-primary data-[state=active]:text-white">
              AI Screening
            </TabsTrigger>
            <TabsTrigger value="outreach" className="data-[state=active]:bg-recruiter-primary data-[state=active]:text-white">
              Outreach
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{candidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{candidate.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{candidate.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <span 
                          key={skill} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Work Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {candidate.workHistory.map((work, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4 pb-1">
                          <h3 className="font-semibold text-lg">{work.title}</h3>
                          <p className="text-gray-600">{work.company} • {work.duration}</p>
                          <ul className="mt-2 space-y-1">
                            {work.description.map((desc, i) => (
                              <li key={i} className="text-gray-700">{desc}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Education</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidate.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-gray-200 pl-4">
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-gray-600">{edu.institution} • {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {candidate.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {candidate.certifications.map((cert, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="screening" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Screening Questions</CardTitle>
                <CardDescription>
                  These questions are generated based on {candidate.name}'s skills and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {screeningQuestions.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50">
                      <h3 className="font-medium text-lg mb-2">Question {index + 1}</h3>
                      <p className="text-gray-800">{question}</p>
                      <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm">
                          Edit Question
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <Button variant="outline">
                    Add Custom Question
                  </Button>
                </div>
                
                <div className="mt-8 border-t pt-6">
                  <h3 className="font-medium text-lg mb-4">Interview Notes</h3>
                  <Textarea 
                    placeholder="Add your interview notes here..."
                    className="min-h-[150px]"
                  />
                  <div className="mt-4 flex justify-end">
                    <Button>Save Notes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="outreach" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Outreach Email</CardTitle>
                <CardDescription>
                  Personalized email template for {candidate.name} based on their profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="p-6 border rounded-lg bg-white">
                    <div className="mb-4 space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">To:</span>
                        <span className="ml-2 font-medium">{candidate.email}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Subject:</span>
                        <span className="ml-2 font-medium">Exciting opportunity for {candidate.skills[0]} developer</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 whitespace-pre-line">
                      <Textarea
                        value={outreachEmail}
                        onChange={(e) => setOutreachEmail(e.target.value)}
                        className="min-h-[300px] border-none p-0 focus-visible:ring-0 resize-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button variant="outline">
                    Save Template
                  </Button>
                  <Button 
                    onClick={handleSendEmail}
                    disabled={isSending}
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <span>Send Email</span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CandidateDetail;
