import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";

interface UserAvatarProps {
  user: User | null;
  className?: string;
}

export function UserAvatar({ user, className = "" }: UserAvatarProps) {
  // If no user is provided, return empty avatar
  if (!user) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="bg-primary text-white">
          ?
        </AvatarFallback>
      </Avatar>
    );
  }

  // Get initials from user's first and last name
  const getInitials = () => {
    if (!user.firstName || !user.lastName) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  // Get background color based on role
  const getBgColor = () => {
    switch (user.role) {
      case "admin":
        return "bg-error-light text-error-dark";
      case "manager":
        return "bg-primary-light text-primary-dark";
      default:
        return "bg-secondary-light text-secondary-dark";
    }
  };

  return (
    <Avatar className={className}>
      <AvatarFallback className={getBgColor()}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
