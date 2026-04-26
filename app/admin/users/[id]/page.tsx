import { getUserByID } from "@/lib/actions/user.actions";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdateUserForm from "./update-user-form";

export const metadata: Metadata = {
	title: 'Update User',
};

const AdminUserUpdatePage = async (props: {
	params: Promise<{ id: string; }>;
}) => {
	const {id} = await props.params;
	console.log(`/admin/users/id/page.tsx ${id}`);

	const user = await getUserByID(id);
	if (!user) notFound();

	console.log('User', user);

	return (
		<>
				<div className="space-y-8 max-w-lg mx-auto">
					<h1 className="h2-bold">Update User</h1>
					<UpdateUserForm user={user} />
				</div>
		</>
	);
}

export default AdminUserUpdatePage;