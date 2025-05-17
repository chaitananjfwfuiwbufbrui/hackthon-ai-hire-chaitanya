
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, LineChart, Line 
} from "recharts";
import { skillDistribution, experienceDistribution, locationDistribution, skillGaps } from "@/lib/mock-data";

const COLORS = ['#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', '#4895ef', '#560bad', '#b5179e'];

const Dashboard = () => {
  // Data for the LineChart
  const skillDemandData = [
    { name: "React", data: [
      { month: "Jan", value: 30 },
      { month: "Feb", value: 35 },
      { month: "Mar", value: 45 },
      { month: "Apr", value: 60 },
      { month: "May", value: 70 },
      { month: "Jun", value: 65 },
    ]},
    { name: "Angular", data: [
      { month: "Jan", value: 50 },
      { month: "Feb", value: 45 },
      { month: "Mar", value: 40 },
      { month: "Apr", value: 30 },
      { month: "May", value: 35 },
      { month: "Jun", value: 40 },
    ]},
    { name: "TypeScript", data: [
      { month: "Jan", value: 20 },
      { month: "Feb", value: 30 },
      { month: "Mar", value: 35 },
      { month: "Apr", value: 45 },
      { month: "May", value: 55 },
      { month: "Jun", value: 60 },
    ]},
  ];

  // Months array for X-axis
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Talent Dashboard</h1>
          <p className="text-gray-600 text-lg">
            Get insights into your talent pool with AI-powered analytics
          </p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{125}</div>
              <p className="text-xs text-green-600 mt-1">↑ 12% increase this month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{5.8} years</div>
              <p className="text-xs text-gray-500 mt-1">Across all candidates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Top Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">Bangalore</div>
              <p className="text-xs text-gray-500 mt-1">40% of candidates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Top Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">JavaScript</div>
              <p className="text-xs text-gray-500 mt-1">80% of candidates</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skills Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Top Skills Distribution</CardTitle>
              <CardDescription>
                Percentage of candidates with each skill
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={skillDistribution.slice(0, 8)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {skillDistribution.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Experience Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Experience Distribution</CardTitle>
              <CardDescription>
                Candidate count by years of experience
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={experienceDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4361ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Location Distribution */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Location Distribution</CardTitle>
              <CardDescription>
                Where your candidates are based
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={locationDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 70,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7209b7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Skill Demand Trends (Fixed version) */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Skill Demand Trends</CardTitle>
              <CardDescription>
                How demand has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      type="category"
                      allowDuplicatedCategory={false}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      data={skillDemandData[0].data}
                      type="monotone"
                      dataKey="value"
                      name="React"
                      stroke="#4361ee"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      data={skillDemandData[1].data}
                      type="monotone"
                      dataKey="value"
                      name="Angular"
                      stroke="#f72585"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      data={skillDemandData[2].data}
                      type="monotone"
                      dataKey="value"
                      name="TypeScript"
                      stroke="#4cc9f0"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Skill Gaps Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Gaps Analysis</CardTitle>
            <CardDescription>
              Insights from the AI to help improve your talent acquisition strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.map((gap, index) => (
                <div key={index} className="p-4 border-l-4 border-amber-500 bg-amber-50 rounded-r-lg">
                  <p className="text-amber-800">{gap}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Consider upskilling in Docker</h4>
                  <p className="text-sm text-gray-600">
                    Based on your talent pool, consider arranging Docker training sessions for your DevOps candidates.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">Target Next.js developers</h4>
                  <p className="text-sm text-gray-600">
                    Next.js skills are in high demand but low supply in your talent pool. Consider targeted recruitment.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Cloud skills are valuable</h4>
                  <p className="text-sm text-gray-600">
                    Candidates with cloud infrastructure experience are more valuable. Look for AWS, Azure, or GCP certifications.
                  </p>
                </div>
                <div className="p-4 bg-rose-50 rounded-lg">
                  <h4 className="font-medium mb-2">Consider GraphQL training</h4>
                  <p className="text-sm text-gray-600">
                    GraphQL skills are becoming increasingly important for full-stack roles. Only 20% of your candidates have experience.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
