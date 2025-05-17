import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, Award, GraduationCap, Briefcase } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CandidateProfile {
  basic_info: {
    id: number;
    first_name: string;
    full_name: string;
    experience_years: string;
    summary: string;
  };
  contact_info: {
    email: string;
    phone: string;
  };
  skills: string[];
  education: {
    details: Array<{
      degree: string;
      year: string | null;
      institution: string | null;
    }>;
    certifications: Array<{
      name: string;
      issuing_organization: string | null;
      year: string | null;
    }>;
  };
  work_experience: {
    summary: string;
    details: any[];
  };
  created_at: string;
}

const TABS = [
  { label: "Profile", value: "profile" },
  { label: "AI Screening", value: "screening" },
  { label: "Outreach", value: "outreach" },
];

const CandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [screeningQuestions, setScreeningQuestions] = useState<string[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("initial_outreach");
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState<string>("");
  const [sendStatus, setSendStatus] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<CandidateProfile>(
          `http://localhost:8000/api/search/resume/${id}`
        );
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load candidate profile");
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  // Fetch screening questions when tab is selected
  useEffect(() => {
    if (activeTab === "screening" && screeningQuestions.length === 0) {
      setLoadingQuestions(true);
      axios.get(`http://localhost:8000/api/search/resume/${id}/screening-questions`)
        .then(res => setScreeningQuestions(res.data.questions || []))
        .catch(() => setScreeningQuestions([]))
        .finally(() => setLoadingQuestions(false));
    }
  }, [activeTab, id, screeningQuestions.length]);

  // Fetch outreach email when tab or template changes
  useEffect(() => {
    if (activeTab === "outreach") {
      setLoadingEmail(true);
      axios.post(`http://localhost:8000/api/search/resume/${id}/generate-email`, null, { params: { template: emailTemplate } })
        .then(res => {
          setGeneratedEmail(res.data.body || "");
          setEmailSubject(res.data.subject || "");
        })
        .catch(() => {
          setGeneratedEmail("");
          setEmailSubject("");
        })
        .finally(() => setLoadingEmail(false));
    }
  }, [activeTab, emailTemplate, id]);

  const handleSendEmail = async () => {
    setSendStatus("");
    try {
      await axios.post(`http://localhost:8000/api/search/resume/${id}/send-email`, {
        to: profile?.contact_info?.email,
        subject: emailSubject,
        body: generatedEmail
      });
      setSendStatus("Email sent successfully!");
    } catch (err) {
      setSendStatus("Failed to send email.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Basic Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{profile.basic_info.full_name || 'Name not provided'}</h1>
                <p className="text-gray-600 mb-4">{profile.basic_info.summary || 'No summary available'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>{profile.basic_info.experience_years || 'No experience listed'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Profile created {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Date not available'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {profile.contact_info?.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${profile.contact_info.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="w-full flex justify-center mb-4">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                  <div className="space-y-3">
                    {profile.contact_info?.email ? (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`mailto:${profile.contact_info.email}`} className="text-blue-600 hover:underline">
                          {profile.contact_info.email}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email not provided</span>
                      </div>
                    )}
                    {profile.contact_info?.phone ? (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <a href={`tel:${profile.contact_info.phone}`} className="text-blue-600 hover:underline">
                          {profile.contact_info.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Phone not provided</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No skills listed</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Education */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Education</h2>
                  <div className="space-y-4">
                    {profile.education.details && profile.education.details.length > 0 ? (
                      profile.education.details.map((edu, index) => (
                        <div key={index} className="flex items-start">
                          <GraduationCap className="h-5 w-5 mr-2 text-gray-500 mt-1" />
                          <div>
                            <p className="font-medium">{edu.degree || 'Degree not specified'}</p>
                            {edu.institution && (
                              <p className="text-sm text-gray-600">{edu.institution}</p>
                            )}
                            {edu.year && (
                              <p className="text-sm text-gray-500">{edu.year}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start text-gray-500">
                        <GraduationCap className="h-5 w-5 mr-2 mt-1" />
                        <span>No education details available</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Certifications</h2>
                  <div className="space-y-4">
                    {profile.education.certifications && profile.education.certifications.length > 0 ? (
                      profile.education.certifications.map((cert, index) => (
                        <div key={index} className="flex items-start">
                          <Award className="h-5 w-5 mr-2 text-gray-500 mt-1" />
                          <div>
                            <p className="font-medium">{cert.name || 'Certification not specified'}</p>
                            {cert.issuing_organization && (
                              <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                            )}
                            {cert.year && (
                              <p className="text-sm text-gray-500">{cert.year}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-start text-gray-500">
                        <Award className="h-5 w-5 mr-2 mt-1" />
                        <span>No certifications listed</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Work Experience */}
              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
                  <div className="space-y-4">
                    {profile.work_experience?.summary ? (
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 mr-2 text-gray-500 mt-1" />
                        <div>
                          <p className="font-medium">{profile.work_experience.summary}</p>
                          {profile.work_experience.details && profile.work_experience.details.length > 0 ? (
                            profile.work_experience.details.map((detail, index) => (
                              <div key={index} className="mt-2">
                                {/* Add more detailed work experience if available */}
                              </div>
                            ))
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start text-gray-500">
                        <Briefcase className="h-5 w-5 mr-2 mt-1" />
                        <span>No work experience details available</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="screening">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">AI-Generated Screening Questions</h2>
                <p className="text-gray-500 mb-4">These questions are generated based on the candidate's skills and experience.</p>
                {loadingQuestions ? (
                  <div>Loading questions...</div>
                ) : screeningQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {screeningQuestions.map((q, i) => (
                      <div key={i} className="bg-gray-50 rounded p-4">
                        <div className="font-medium mb-1">Question {i + 1}</div>
                        <div>{q}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500">No questions generated.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outreach">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">AI-Generated Emails</h2>
                <p className="text-gray-500 mb-4">Choose the type of email you want to send to this candidate.</p>
                <div className="flex gap-2 mb-4">
                  <Button variant={emailTemplate === "initial_outreach" ? "default" : "outline"} onClick={() => setEmailTemplate("initial_outreach")}>Initial Outreach</Button>
                  <Button variant={emailTemplate === "interview_invitation" ? "default" : "outline"} onClick={() => setEmailTemplate("interview_invitation")}>Interview Invitation</Button>
                  <Button variant={emailTemplate === "congratulations" ? "default" : "outline"} onClick={() => setEmailTemplate("congratulations")}>Congratulations</Button>
                  <Button variant={emailTemplate === "regret" ? "default" : "outline"} onClick={() => setEmailTemplate("regret")}>Regret</Button>
                </div>
                {loadingEmail ? (
                  <div>Generating email...</div>
                ) : generatedEmail ? (
                  <div className="bg-gray-50 rounded p-4 whitespace-pre-line">
                    <div className="mb-2">
                      <span className="font-semibold">Subject:</span> {emailSubject}
                    </div>
                    <div>
                      <span className="font-semibold">Body:</span>
                      <div className="mt-1">{generatedEmail}</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleSendEmail} disabled={!profile?.contact_info?.email}>Send Email</Button>
                      {sendStatus && <span className={sendStatus.includes("success") ? "text-green-600" : "text-red-600"}>{sendStatus}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No email generated.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CandidateProfile; 