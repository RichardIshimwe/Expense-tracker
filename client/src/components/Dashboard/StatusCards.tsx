import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExpenseStats } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

interface StatusCardsProps {
  stats: ExpenseStats | undefined;
  isLoading: boolean;
}

export function StatusCards({ stats, isLoading }: StatusCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-neutral-light">
                  <Skeleton className="h-6 w-6" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-neutral-light px-4 py-2 sm:px-6">
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Pending Expenses",
      value: stats?.pending || 0,
      icon: "pending_actions",
      bgColor: "bg-warning-light",
      iconColor: "text-warning-dark",
      link: "/expenses?status=pending",
    },
    {
      title: "Approved This Month",
      value: stats?.approved || 0,
      icon: "check_circle",
      bgColor: "bg-success-light",
      iconColor: "text-success-dark",
      link: "/expenses?status=approved",
    },
    {
      title: "Rejected This Month",
      value: stats?.rejected || 0,
      icon: "highlight_off",
      bgColor: "bg-error-light",
      iconColor: "text-error-dark",
      link: "/expenses?status=rejected",
    },
    {
      title: "Total Amount This Month",
      value: formatCurrency(stats?.total || 0),
      icon: "paid",
      bgColor: "bg-primary-light",
      iconColor: "text-primary-dark",
      link: "/reports",
      isAmount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${card.bgColor} rounded-md p-3`}>
                <span className={`material-icons ${card.iconColor}`}>{card.icon}</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-main truncate">{card.title}</dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-dark">{card.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-neutral-light px-4 py-2 sm:px-6">
            <div className="text-sm">
              <Link href={card.link} className="font-medium text-primary hover:text-primary-dark">
                {card.isAmount ? "View breakdown" : "View all"}
              </Link>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
