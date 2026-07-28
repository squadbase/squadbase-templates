import { useUser } from "@squadbase/react"
import type { User } from "@squadbase/react"
import { UserIcon } from "lucide-react"
import {
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  cn,
} from "@squadbase/vantage/ui"

/**
 * Squadbase-authenticated user chip for the app shell.
 *
 * The Vantage UI kit has no `Avatar`, so the initials bubble is inlined here —
 * it is a handful of classes and only ever used by this component.
 */
function Avatar({ user, className }: { user: User; className?: string }) {
  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-medium",
        className,
      )}
    >
      {user.iconUrl ? (
        <img src={user.iconUrl} alt={fullName} className="size-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium">{children}</div>
    </div>
  )
}

function UserInfo({ user }: { user: User }) {
  const fullName = `${user.firstName} ${user.lastName}`
  const rolesHref = navigator.language.startsWith("ja")
    ? "https://www.squadbase.dev/ja/docs/access-control#プロジェクトロール"
    : "https://www.squadbase.dev/docs/access-control#project-roles"

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-sidebar-accent" />
        }
      >
        <Avatar user={user} className="size-9 text-sm" />
        <span className="flex flex-col overflow-hidden">
          <span className="truncate text-sm font-medium">{fullName}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Avatar user={user} className="size-20 text-2xl" />
          <div className="w-full space-y-4">
            <DetailRow label="Name">{fullName}</DetailRow>
            <DetailRow label="Username">{user.username}</DetailRow>
            <DetailRow label="Email">{user.email}</DetailRow>
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Project Roles</p>
                <a
                  href={rolesHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary/80"
                >
                  Learn more
                </a>
              </div>
              {user.roles.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No roles assigned</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UserInfoFallback() {
  return (
    <div className="flex w-full items-center gap-3 rounded-md p-2">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <UserIcon className="size-4 text-muted-foreground" />
      </span>
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-muted-foreground">Guest</span>
        <span className="truncate text-xs text-muted-foreground">
          Unable to retrieve user information
        </span>
      </div>
    </div>
  )
}

export function UserCard() {
  const userState = useUser()

  if (userState.status === "success") {
    return <UserInfo user={userState.data} />
  }

  return <UserInfoFallback />
}
