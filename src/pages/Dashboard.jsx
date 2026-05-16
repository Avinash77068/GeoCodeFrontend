import { useQuery } from "@tanstack/react-query";
import {
  Search,
  MessageSquare,
  Send,
  Building2,
  Clock,
  BarChart2,
  SearchIcon,
  PencilIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getStats } from "../api/export";
import { useAuth } from "../context/AuthContext";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import { PageLoader } from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value ?? "—"}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </CardBody>
    </Card>
  );
}

function channelBadgeColor(channel) {
  return { email: "blue", sms: "green", whatsapp: "purple" }[channel] || "gray";
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

  if (isLoading) return <PageLoader />;

  const stats = data?.data?.stats;
  const recentSearches = data?.data?.recentSearches || [];
  const channelStats = data?.data?.channelStats || [];

  const handleSearchClick = (search) => {
    const params = new URLSearchParams();
    params.set("location", search.location?.address || "");
    params.set("radius", search.radius || "");
    if (search.filters?.category?.length > 0) {
      params.set("category", search.filters.category[0]);
    }
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's your outreach overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Search}
          label="Total Searches"
          value={stats?.totalSearches}
          color="blue"
        />
        <StatCard
          icon={Building2}
          label="Businesses Reached"
          value={stats?.uniqueBusinesses}
          color="green"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages Created"
          value={stats?.totalMessages}
          color="purple"
        />
        <StatCard
          icon={Send}
          label="Messages Sent"
          value={stats?.sentMessages}
          color="orange"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <h2 className="font-semibold text-gray-800 text-sm">
                Recent Searches
              </h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {recentSearches.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No searches yet.{" "}
                <Link to="/search" className="text-brand-600 hover:underline">
                  Start searching
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentSearches.map((s) => (
                  <li
                    key={s._id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleSearchClick(s)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 font-medium truncate max-w-[180px]">
                          {s.location?.address}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.radius}km · {s.resultsCount} results
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                    <PencilIcon
                      size={16}
                      fill="green"
                      className="text-green-400 ml-2 shrink-0"
                    />
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-gray-400" />
              <h2 className="font-semibold text-gray-800 text-sm">
                Messages by Channel
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {channelStats.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No messages sent yet.
              </p>
            ) : (
              channelStats.map((c) => (
                <div key={c._id} className="flex items-center justify-between">
                  <Badge color={channelBadgeColor(c._id)}>{c._id}</Badge>
                  <span className="text-sm font-semibold text-gray-700">
                    {c.count}
                  </span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-gray-800">
              Ready to find new leads?
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Search local businesses and reach out with AI-generated messages.
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Search size={15} />
            New Search
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
