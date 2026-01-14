"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User } from "@squadbase/nextjs";

type Props = {
  user: User;
};

export function UserInfo({ user }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-sidebar-accent">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.iconUrl ?? undefined} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium">{fullName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.iconUrl ?? undefined} alt={fullName} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="w-full space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roles</p>
              {user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="font-medium">None</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
