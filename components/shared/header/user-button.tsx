import Link from "next/link";
import { auth } from "@/auth";
import { signOutUser } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserIcon } from "lucide-react";

const UserButton = async () => {
  const session = await auth();

	// return; if NOT logged in
  if (!session) {
    return (
      <Button asChild>
        <Link href="/sign-in">
          <UserIcon />Sign In
        </Link>
      </Button>
    );
  }

	// return; if logged in
	const firstInitial = session.user?.name?.charAt(0).toUpperCase() ?? '?';
  return (
		<div className="flex gap-2 items-center">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className="flex items-center">
						<Button variant='ghost' className="relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200">
							{firstInitial}
						</Button>
					</div>
				</DropdownMenuTrigger>
			</DropdownMenu>
		</div>
	);
}
 
export default UserButton;