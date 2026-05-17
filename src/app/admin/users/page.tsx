"use client";
import { useState } from "react";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { toast } from "sonner";
import { UsersHeader } from "@/components/admin/users/UsersHeader";
import { UsersStats } from "@/components/admin/users/UserStats";
import { UsersTable } from "@/components/admin/users/UserTable";
import { PaginationControls } from "@/components/common/Pagination";
import { CreateModelUser } from "@/components/admin/users/CreateModelUser";
import { UpdateModelUser } from "@/components/admin/users/UpdateModelUser";
import { ViewModelUser } from "@/components/admin/users/ViewModelUser";
import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/queries";
import { User, UserFilters, UpdateUserData } from "@/types/user";
import { CreateUserData } from "@/hooks/queries/useProfile";
import { getSafeErrorMessage } from "@/api";

export default function AdminUsersPage() {
  // Use URL filters hook
  const { filters, updateFilter, updateFilters } = useUrlFilters<UserFilters>({
    defaultFilters: {
      page: 1,
      limit: 10,
      search: "",
      role: "",
      isVerifiedEmail: null,
    },
    basePath: "/admin/users",
  });


  const currentPage = Number(filters.page);
  const pageSize = Number(filters.limit);
  const searchTerm = filters.search as string;
  const selectedRole = filters.role as string;
  const selectedVerified = filters.isVerifiedEmail as boolean | null;


  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(searchTerm &&
      searchTerm.trim() !== "" && { search: searchTerm.trim() }),
    ...(selectedRole &&
      selectedRole.trim() !== "" && { role: selectedRole.trim() }),
    ...(selectedVerified !== null && { isVerifiedEmail: selectedVerified }),
  };


  const { data: usersData, isLoading, error } = useAllUsers(queryParams);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const users: User[] = usersData?.users || [];
  const pagination = usersData?.pagination || null;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ============= Event Handlers =============

  const handleOpenCreateModal = () => {
    setCreateModalOpen(true);
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await createMutation.mutateAsync(userData);
      setCreateModalOpen(false);
      toast.success("User created successfully");
    } catch (error) {
      const err = error as Error;
      console.error("Create user error:", err);
      toast.error(getSafeErrorMessage(error, "Error creating user. Please try again."));
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUpdateModalOpen(true);
  };

  const handleEditFromView = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(false);
    setUpdateModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setUpdateModalOpen(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async (userData: Omit<UpdateUserData, 'id'>) => {
    if (!selectedUser) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedUser._id,
        username: userData.username || selectedUser.username,
        email: userData.email || selectedUser.email,
        isVerifiedEmail:
          userData.isVerifiedEmail ?? selectedUser.isVerifiedEmail,
        roles: userData.roles || selectedUser.roles,
        permissions: userData.permissions,
      });
      handleCloseEditModal();
      toast.success("User updated successfully");
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Failed to update user. Please try again."));
    }
  };

  // Filter handlers
  const handlePageChange = (page: number) => {
    updateFilter("page", page);
  };

  const handlePageSizeChange = (size: number) => {
    updateFilters({ limit: size, page: 1 });
  };

  const handleSearch = (value: string) => {
    updateFilters({ search: value, page: 1 });
  };

  const handleRoleFilterChange = (role: string) => {
    updateFilters({ role: role, page: 1 });
  };

  const handleVerifiedFilterChange = (isVerified: boolean | null) => {
    updateFilters({ isVerifiedEmail: isVerified, page: 1 });
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setUpdateModalOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteMutation.mutateAsync(user._id);
      toast.success("User deleted successfully");
    } catch (error: unknown) {
      toast.error(getSafeErrorMessage(error, "Failed to delete user. Please try again."));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewModalOpen(true);
  };

  // Calculate stats
  const totalUsers = pagination?.totalItems || users.length;
  const verifiedUsers = users.filter((user) => user.isVerifiedEmail).length;
  const usersWithAddress = users.filter(
    (user) => user.addresses && user.addresses.length > 0
  ).length;

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentUsers = users.filter((user) => {
    try {
      return new Date(user.createdAt) > oneWeekAgo;
    } catch {
      return false;
    }
  }).length;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">
          Error: {getSafeErrorMessage(error, "Failed to load users")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header Section */}
      <UsersHeader onOpenCreate={handleOpenCreateModal} />

      {/* Stats Section */}
      <UsersStats
        totalUsers={totalUsers}
        verifiedUsers={verifiedUsers}
        usersWithAddress={usersWithAddress}
        recentUsers={recentUsers}
      />

      {/* Main Content Area */}
      <UsersTable
        users={users}
        searchTerm={searchTerm}
        pageSize={pageSize}
        isLoading={isLoading}
        onSearch={handleSearch}
        onPageSizeChange={handlePageSizeChange}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onView={handleViewUser}
        onRoleFilterChange={handleRoleFilterChange}
        onVerifiedFilterChange={handleVerifiedFilterChange}
        selectedRole={selectedRole}
        selectedVerified={selectedVerified}
      />

      <div className="mt-6">
        <PaginationControls
          pagination={pagination}
          onPageChange={handlePageChange}
          itemName="users"
        />
      </div>

      <CreateModelUser
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateUser}
        isLoading={createMutation.isPending}
      />

      <ViewModelUser
        open={viewModalOpen}
        onOpenChange={handleCloseModals}
        user={selectedUser}
        onEdit={handleEditFromView}
      />

      <UpdateModelUser
        open={updateModalOpen}
        onOpenChange={handleCloseEditModal}
        user={selectedUser}
        onUpdate={handleUpdateUser}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
