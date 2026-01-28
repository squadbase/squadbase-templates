import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserIcon } from "lucide-react";

export function UserInfoFallback() {
  return (
    <div className="flex w-full items-center gap-3 rounded-md p-2">
      <Avatar className="h-9 w-9">
        <AvatarFallback>
          <UserIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-muted-foreground">
          Guest
        </span>
        <span className="truncate text-xs text-muted-foreground">
          Unable to retrieve user information
        </span>
      </div>
    </div>
  );
}
