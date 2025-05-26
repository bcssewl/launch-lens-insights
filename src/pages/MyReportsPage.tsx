
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import DashboardHeader from '@/components/DashboardHeader';
import ReportCard, { Report } from '@/components/reports/ReportCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, FolderOpen, Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const sampleReportsData: Report[] = [
  { id: '1', ideaName: "SaaS for Pet Owners", score: 8.2, maxScore: 10, date: "3 days ago", status: "Validated", preview: "Subscription-based platform for pet care management, connecting owners with vets and services." },
  { id: '2', ideaName: "AI Resume Builder", score: 4.1, maxScore: 10, date: "1 week ago", status: "High Risk", preview: "AI-powered tool to create professional resumes, with ATS optimization and template library." },
  { id: '3', ideaName: "Local Food Delivery", score: 6.7, maxScore: 10, date: "2 weeks ago", status: "Caution", preview: "Hyperlocal food delivery service focusing on suburban areas and partnering with small restaurants." },
  { id: '4', ideaName: "Crypto Trading App", score: 3.8, maxScore: 10, date: "3 weeks ago", status: "Not Recommended", preview: "Mobile application for cryptocurrency trading, portfolio tracking, and market news aggregation." },
  { id: '5', ideaName: "B2B Analytics Tool", score: 7.9, maxScore: 10, date: "1 month ago", status: "Promising", preview: "Business intelligence dashboard tailored for small to medium-sized businesses with actionable insights." },
  { id: '6', ideaName: "Social Learning Platform", score: 5.4, maxScore: 10, date: "2 months ago", status: "Archived", preview: "Peer-to-peer learning platform for professionals to share skills and knowledge through micro-courses." },
];

const MyReportsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // Add states for filters if implementing filter logic later
  // const [sortBy, setSortBy] = useState('Most Recent');
  // const [filterScore, setFilterScore] = useState('All');
  // const [filterStatus, setFilterStatus] = useState('All');

  // Placeholder for filtering logic
  const filteredReports = sampleReportsData.filter(report =>
    report.ideaName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardHeader>My Reports</DashboardHeader>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Idea Analyses</h2>
            <p className="text-sm text-muted-foreground">View and manage all your past idea validation reports.</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/dashboard/validate">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>

        {/* Filter and Search Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="relative md:col-span-2 lg:col-span-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your ideas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select defaultValue="recent">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest_score">Highest Score</SelectItem>
              <SelectItem value="lowest_score">Lowest Score</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all_scores">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Score..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_scores">All Scores</SelectItem>
              <SelectItem value="high">High (7-10)</SelectItem>
              <SelectItem value="medium">Medium (4-7)</SelectItem>
              <SelectItem value="low">Low (0-4)</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all_status">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by Status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All Statuses</SelectItem>
              <SelectItem value="Validated">Validated</SelectItem>
              <SelectItem value="Promising">Promising</SelectItem>
              <SelectItem value="Caution">Caution</SelectItem>
              <SelectItem value="High Risk">High Risk</SelectItem>
              <SelectItem value="Not Recommended">Not Recommended</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports Grid or Empty State */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg mt-8">
            <FolderOpen className="mx-auto h-20 w-20 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">No reports found</h3>
            {searchTerm ? (
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria.</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Start your first idea validation to see your reports here.</p>
            )}
            {!searchTerm && (
              <Button className="mt-6" asChild>
                <Link to="/dashboard/validate">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Validate First Idea
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyReportsPage;
